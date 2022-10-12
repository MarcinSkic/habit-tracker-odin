import A11yDialog from "a11y-dialog";
import "normalize.css";
import "./main.scss";

const DOMController = (function(){
    function htmlToElements(html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.childNodes;
    }

    function generateMobileHeader(){
        const header = document.querySelector('header');

        header.innerHTML = `<a href="/dist/index.html"><button class="today">Today</button></a>
        <button class="add-habit" data-a11y-dialog-show="pick-habit">+</button>
        <a href="/dist/pages/raports.html"><button class="raports">Raports</button></a>`;
    }

    function habitPickerDialog(){
        const dialogContainer = document.getElementById("pick-habit");
        /*dialogContainer.innerHTML = ``*/
        
        const dialog = new A11yDialog(dialogContainer);
    }

    function createHabitCreatorDialog(){
        const dialogContainer = document.getElementById("create-habit");
        /*dialogContainer.innerHTML = ``*/
        
        const dialog = new A11yDialog(dialogContainer);
        dialog.on('show',generateHabitDialog);
        const createHabitForm = dialogContainer.querySelector("form");

        createHabitForm.addEventListener('submit',testFormData);
    }

    function testFormData(event){
        let formData = new FormData(this);
        console.log(this);
        console.log(...formData.entries());
        event.preventDefault();
    }

    const habitCreator = (function(){

        function generateDialogContent(type){
            const container = document.createElement("div");

            switch(type){
                case "positiveYN":
                    console.log("Sukcesywnie wygenerowano ");
                    break;
                case "negativeYN":
                    break;
                case "positiveNumerical":
                    break;
                case "negativeNumerical":
                    break;
            }
        }

        function generatePositiveYN(){
            return 0;
        }

        function generateNegativeYN(){

        }

        function generatePositiveNumerical(){

        }

        function generateNegativeNumerical(){

        }

        return {generateDialogContent};
    })();

    function generateHabitDialog(dialogElement, event){
        habitCreator.generateDialogContent(event.currentTarget.value);
    }

    return {generateMobileHeader,createHabitCreatorDialog,habitPickerDialog};
})();

DOMController.generateMobileHeader();
DOMController.habitPickerDialog();
DOMController.createHabitCreatorDialog();
