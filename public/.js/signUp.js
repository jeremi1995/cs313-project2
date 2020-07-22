document.getElementById("signUp").addEventListener("click", signUp);

function signUp() {
    let first_name = document.getElementById("first_name").value;
    let last_name = document.getElementById("last_name").value;
    let user_name = document.getElementById("user_name").value;
    let password = document.getElementById("password").value;
    let date_of_birth = document.getElementById("date_of_birth").value;

    let reqURL = "/signUp";
    let query = "first_name=" + first_name + "&" +
        "last_name=" + last_name + "&" +
        "user_name=" + user_name + "&" +
        "password=" + password + "&" +
        "date_of_birth=" + date_of_birth;

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            handleSignUpResponse(JSON.parse(this.response));
        }
    }

    xhr.open("POST", reqURL, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(query);

}

function handleSignUpResponse(res) {
    if (res.success == false) {
        document.getElementById("result").innerHTML = res.message;
    }
    else {
        alert(res.message);
        window.location.replace("/");
    }
}