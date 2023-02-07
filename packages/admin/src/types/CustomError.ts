interface CustomError {
  status?: string;
  date?: string;
  message: string;
  description?: string;
  body?: string;
  code: string;
}

export default CustomError;
