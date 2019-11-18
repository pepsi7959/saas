const http = require("../../commons/http");

const mockRequest = (sessionData, body) => ({
    session: { data: sessionData },
    body: body,
});
  
const mockResponse = () => {
    const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
};

describe("test success function", () => {
    test('should success if there are complete parameters', () => {
        const res = mockResponse();
        http.success(res, {n: 1});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ 
            success: true,
            code: 20000,
            desc: null,
            data: {n: 1}
        });
    });

    test('should return false if empty response parameter', () => {
        const res = mockResponse();
        expect(http.success(null, null)).toBe(false);
    });

});

describe("test http error function", () => {
    test('should 401 if ', () => {
        const res = mockResponse();
        //exports.success = function( res, data)
        http.error(res, 404, 404000, "Not found an user");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ 
            success: false,
            code: 404000,
            desc: "Not found an user",
            data: null 
        })
    });

    test('should return false if empty response parameter', () => {
        const res = mockResponse();
        expect(http.error(null, null)).toBe(false);
    });
    
})