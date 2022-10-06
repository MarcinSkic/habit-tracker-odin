import A11yDialog from "a11y-dialog";
import "normalize.css";
import "./main.scss";

const DOMController = (function(){
    function generateMobileHeader(){
        const header = document.querySelector('header');

        header.innerHTML = `<a href="/dist/index.html"><button class="today">Today</button></a>
        <button class="add-habit">+</button>
        <a href="/dist/pages/raports.html"><button class="raports">Raports</button></a>`;
    }

    function createHabitCreatorDialog(){
        const dialogContainer = document.getElementById("pick-habit");
        /*dialogContainer.innerHTML = ``*/
        
        const dialog = new A11yDialog(dialogContainer);
        
        console.log("show");
        dialog.show();
    }

    return {generateMobileHeader,createHabitCreatorDialog};
})();

DOMController.generateMobileHeader();
DOMController.createHabitCreatorDialog();