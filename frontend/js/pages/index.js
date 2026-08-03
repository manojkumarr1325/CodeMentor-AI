// ===============================
// Hero Typing Animation
// ===============================

const preview = document.getElementById("typingPreview");

if(preview){

const message=`✔ Problem Explanation

✔ Approach

✔ Algorithm

✔ Time Complexity : O(n)

✔ Space Complexity : O(n)

✔ C++ Solution Generated Successfully 🚀`;

let i=0;

function type(){

    if(i<message.length){

        preview.innerHTML=message.substring(0,i)+'<span class="cursor">|</span>';

        i++;

        setTimeout(type,28);

    }

    else{

        setTimeout(()=>{

            i=0;

            preview.innerHTML="";

            type();

        },2500);

    }

}

type();

}

// ===============================
// Animated Counters
// ===============================

const counters=document.querySelectorAll(".counter");

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(!entry.isIntersecting) return;

const counter=entry.target;

const target=+counter.dataset.target;

let current=0;

const increment=Math.max(1,Math.ceil(target/60));

function update(){

    current+=increment;

    if(current>=target){

        counter.innerText=target;

    }

    else{

        counter.innerText=current;

        requestAnimationFrame(update);

    }

}

update();

observer.unobserve(counter);

});

});

counters.forEach(counter=>observer.observe(counter));

// =====================================
// Scroll Reveal
// =====================================

const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("active");

            revealObserver.unobserve(entry.target);

        }

    });

},{
    threshold:0.15
});

reveals.forEach(section => revealObserver.observe(section));