export async function usertLogin(studentID, password){
    const BASE_URL = "http://localhost:8000/api";
    let options = {
        method: "POST",
        header: {
            Accept: 'application/json',
            'Content-Type:': 'application/json',

        }
    }
    const response = await fetch(BASE_URL + '/login', options);
    const data = await response.json();
    return data;
}