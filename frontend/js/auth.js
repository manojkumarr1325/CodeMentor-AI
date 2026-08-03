/* ==========================================
   CodeMentor AI - Authentication
========================================== */


const API_URL = "https://codementor-ai-kfkz.onrender.com/auth";



/* ==========================
   Signup
========================== */

const signupForm = document.getElementById("signupForm");


if (signupForm) {


    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const username =
            document.getElementById("name").value.trim();


        const email =
            document.getElementById("email").value.trim();


        const password =
            document.getElementById("password").value;


        const confirmPassword =
            document.getElementById("confirmPassword").value;



        if(password !== confirmPassword){

            alert("Passwords do not match.");

            return;

        }



        try {


            const response = await fetch(
                `${API_URL}/signup`,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body: JSON.stringify({

                        username,
                        email,
                        password

                    })

                }
            );



            const data = await response.json();



            if(data.success){


                alert("Account created successfully!");

                window.location.href="login.html";


            }
            else{


                alert(data.message);


            }



        }
        catch(error){


            console.error(error);

            alert("Server error. Please try again.");


        }



    });


}






/* ==========================
   Login
========================== */


const loginForm = document.getElementById("loginForm");


if(loginForm){


    loginForm.addEventListener("submit", async(e)=>{


        e.preventDefault();



        const email =
            document.getElementById("email").value.trim();


        const password =
            document.getElementById("password").value;




        try{


            const response = await fetch(

                `${API_URL}/login`,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":"application/json"

                    },

                    body:JSON.stringify({

                        email,
                        password

                    })

                }

            );



            const data = await response.json();




            if(data.success){



                localStorage.setItem(
                    "codementor_token",
                    data.token
                );



                localStorage.setItem(
                    "codementor_user",
                    JSON.stringify(data.user)
                );



                window.location.href="dashboard.html";



            }
            else{


                alert(data.message);


            }



        }
        catch(error){


            console.error(error);

            alert("Server error. Please try again.");


        }



    });


}

/* ==========================================
   Dashboard Authentication Guard
========================================== */


const protectedPages = [
    "dashboard.html"
];


const currentPage = window.location.pathname.split("/").pop();


if (protectedPages.includes(currentPage)) {

    const token = localStorage.getItem("codementor_token");


    if (!token) {

        window.location.href = "login.html";

    }

}

/* ==========================================
   CodeMentor AI - User Session
========================================== */


function getCurrentUser(){

    const user = localStorage.getItem("codementor_user");

    if(!user){
        return null;
    }

    return JSON.parse(user);

}



function logout(){

    localStorage.removeItem("codementor_token");

    localStorage.removeItem("codementor_user");

    window.location.href = "login.html";

}


window.logout = logout;
// Make available globally

window.getCurrentUser = getCurrentUser;

//window.logout = logout;

/* ==========================================
   Redirect Logged-in Users
========================================== */


const authPages = [
    "login.html",
    "signup.html"
];


const authCurrentPage =
    window.location.pathname.split("/").pop();



const existingToken =
    localStorage.getItem("codementor_token");



if (
    authPages.includes(authCurrentPage)
    &&
    existingToken
) {

    window.location.href = "dashboard.html";

}
