mockRequest = (sessionData, body) => ({
    session: { data: sessionData },
    body: body,
});
  
mockResponse = () => {
    const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
};

module.exports = {
    mockRequest,
    mockResponse
}