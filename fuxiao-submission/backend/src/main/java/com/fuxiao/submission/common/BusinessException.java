package com.fuxiao.submission.common;

import org.springframework.http.HttpStatus;

public class BusinessException extends RuntimeException {

    private final int code;
    private final HttpStatus status;

    public BusinessException(String message) {
        this(400, HttpStatus.BAD_REQUEST, message);
    }

    public BusinessException(int code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public static BusinessException notFound(String what) {
        return new BusinessException(404, HttpStatus.NOT_FOUND, what + "不存在");
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(401, HttpStatus.UNAUTHORIZED, message);
    }

    public int getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
