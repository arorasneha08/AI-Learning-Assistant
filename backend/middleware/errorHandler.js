const errorHandler = (err, req, res, next) => {
    console.log(err); 
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if(err.name === "CastError"){
        statusCode = 400;
        message = `Resource not found. Invalid ${err.path}`;
    }

    if(err.name === "ValidationError"){
        statusCode = 400;
        message = Object.values(err.errors).map(value => value.message).join(", ");
    }
    if(err.code === 11000){
        statusCode = 400;
        message = `Duplicate field value entered for ${Object.keys(err.keyValue)}. Please use another value.`;
    }
    if(err.code === "LIMIT_FILE_SIZE"){
        statusCode = 400;
        message = "File size is too large";
    }
    if(err.name === "JsonWebTokenError"){
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }
    if(err.name === "TokenExpiredError"){
        statusCode = 401;
        message = "Your token has expired. Please log in again.";
    }
    if (err.name === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size is too large. Maximum allowed size is 5MB.';
    }
    if (err.message === 'Request aborted') {
        statusCode = 400;
        message = 'Upload cancelled';
    }
    console.error("Error : " , {
        message : err.message ,
        stack : process.env.NODE_ENV === "development" ? err.stack : undefined
    })
    res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }); 
}

export default errorHandler;