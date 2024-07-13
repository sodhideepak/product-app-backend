

// here we just append in class apiresponse in order to get custom message which helps to iedntify response easily
class ApiResponse {
    constructor(
        statuscode,
        data,
        message="success"
    ){
        this.statuscode=statuscode
        this.data=data
        this.success=statuscode < 400
        this.message=message

    }
}


export {ApiResponse}