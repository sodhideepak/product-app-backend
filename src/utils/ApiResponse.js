

// here we just append in class apiresponse in order to get custom message which helps to iedntify response easily
class ApiResponse {
    constructor(
        statuscode,
        data,
        message="success"
    ){
        this.statuscode=statuscode
        this.data=data
        this.message=message
        this.success=statuscode < 400

    }
}