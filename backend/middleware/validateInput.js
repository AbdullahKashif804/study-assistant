function invalid(field, rule) {
  throw new Error(`${field} ${rule}`);
}

function numeric(value, field) {
  if (typeof value !== "number" && typeof value !== "string") invalid(field, "must be a number");
  if (typeof value === "string" && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) {
    invalid(field, "must be a valid numeric value");
  }
  const result = Number(value);
  if (!Number.isFinite(result) || Math.abs(result) > Number.MAX_SAFE_INTEGER) invalid(field, "must be a finite, safely representable number");
  return result;
}

const text = (required = false) => ({ type: "text", required });
const date = (required = false) => ({ type: "date", required });
const id = (required = false) => ({ type: "id", required });
const semester = { type: "semester", required: true };
const options = values => ({ type: "enum", values });
const marks = { totalMark: { type: "total", required: true }, obtainedMark: { type: "obtained" } };
const academic = { title: text(true), course: id(true), dueDate: date(true), ...marks };
const task = {
  title: text(true), description: text(), priority: options(["High", "Medium", "Low"]),
  status: options(["Pending", "In Progress", "Completed"]),
};
const schemas = {
  assignment: { ...academic, description: text(true), status: options(["Pending", "Completed", "Submitted", "Graded"]) },
  project: { ...academic, description: text(true), technologies: { type: "technologies", required: true }, status: options(["In Progress", "Completed", "Graded"]) },
  quiz: academic,
  course: { title: text(true), courseCode: text(true), semester, instructor: text(true), description: text(true), status: options(["Active", "Completed"]) },
  note: { title: text(true), content: text(true), course: id() },
  dailyTask: { ...task, taskDate: date(true) },
  todoTask: { ...task, dueDate: date(true) },
  signup: { first_name: text(true), last_name: text(true), email: text(true), password: text(true), currentSemester: semester, agreedToTerms: { type: "terms", required: true } },
  signin: { email: text(true), password: text(true) },
  verifyEmail: { email: text(true), verificationCode: { type: "otp", required: true } },
  resendVerification: { email: text(true) },
  profile: { first_name: text(), last_name: text(), currentSemester: { ...semester, required: false }, dateOfBirth: date(), university: text(), program: text(), bio: { type: "text", max: 500 } },
  password: { currentPassword: text(true), newPassword: text(true), confirmPassword: text(true) },
};

function validateField(value, field, rule) {
  const empty = value === undefined || value === null || value === "";
  if (empty) {
    if (rule.type === "enum") invalid(field, "has an unsupported value");
    if (rule.required || rule.type === "semester" || field === "first_name") invalid(field, "is required");
    if (rule.type === "obtained" || rule.type === "id" || rule.type === "date") return null;
    if (value !== undefined && typeof value !== "string") invalid(field, "must be text");
    return value;
  }
  if (["total", "obtained", "semester"].includes(rule.type)) {
    const number = numeric(value, field);
    if (rule.type === "semester" && (!Number.isInteger(number) || number < 1 || number > 8)) invalid(field, "must be an integer between 1 and 8");
    if (rule.type === "total" && number <= 0) invalid(field, "must be greater than zero");
    if (rule.type === "obtained" && number < 0) invalid(field, "cannot be negative");
    return number;
  }
  if (rule.type === "terms") {
    if (value !== true) invalid(field, "must be accepted as true");
    return value;
  }
  if (rule.type === "technologies") {
    let list = value;
    if (typeof value === "string") {
      try { list = JSON.parse(value); } catch { invalid(field, "must be a list of text values"); }
    }
    if (!Array.isArray(list) || !list.length || list.some(item => typeof item !== "string" || !item.trim())) invalid(field, "must be a nonempty list of text values");
    return JSON.stringify(list); // Existing project controllers parse this multipart field.
  }
  if (typeof value !== "string") invalid(field, "must be text");
  if ((rule.required || field === "first_name") && !value.trim()) invalid(field, "is required");
  if (rule.max && value.length > rule.max) invalid(field, `must not exceed ${rule.max} characters`);
  if (rule.type === "id" && !/^[a-f\d]{24}$/i.test(value)) invalid(field, "must be a valid identifier");
  if (rule.type === "enum" && !rule.values.includes(value)) invalid(field, "has an unsupported value");
  if (rule.type === "otp" && !/^\d{6}$/.test(value)) invalid(field, "must contain six digits");
  if (rule.type === "date") {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
    if (!match || !Number.isFinite(Date.parse(value))) invalid(field, "must be a valid date");
    const [, year, month, day] = match.map(Number);
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (month < 1 || month > 12 || day < 1 || day > days) invalid(field, "must be a valid calendar date");
  }
  return value;
}

function validateInput(name) {
  const schema = schemas[name];
  if (!schema) throw new Error("Unknown input validation schema");
  return (req, res, next) => {
    try {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) invalid("Request body", "must be an object");
      const normalized = { ...req.body };
      for (const [field, rule] of Object.entries(schema)) {
        if (!Object.hasOwn(req.body, field) && !rule.required) continue;
        normalized[field] = validateField(req.body[field], field, rule);
      }
      if (Object.hasOwn(schema, "totalMark") && normalized.obtainedMark != null && normalized.obtainedMark > normalized.totalMark) {
        invalid("obtainedMark", "cannot exceed totalMark");
      }
      req.body = normalized;
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next();
  };
}

function validateRecordId(req, res, next) {
  const value = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(value)) return res.status(400).json({ success: false, message: "Invalid record identifier" });
  return next();
}

module.exports = { validateInput, validateRecordId };
