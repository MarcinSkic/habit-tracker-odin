import A11yDialog from "a11y-dialog";
import "normalize.css";
import "./main.scss";

function baseHabitFactory(formData){

    const DOMdata = {
        type: formData.get('type'),
        title: formData.get('title'),
        description: formData.get('description'),
        color: formData.get('color'),
        frequency: formData.get('frequency'),
        startShowHour: formData.get('startShowHour'),
        endShowHour: formData.get('endShowHour')
    }

    const markedDays = {};

    return {DOMdata,markedDays};
}

const Model = (function() {
    const habits = [];

    return {habits}
})();

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

    function createHabitPickerDialog(){
        const dialogContainer = document.getElementById("pick-habit");
        /*dialogContainer.innerHTML = ``*/
        
        const dialog = new A11yDialog(dialogContainer);
    }

    function createHabitCreatorDialog(){
        const dialogContainer = document.getElementById("create-habit");
        /*dialogContainer.innerHTML = ``*/
        
        const dialog = new A11yDialog(dialogContainer);
        dialog.on('show',generateHabitDialog);
    }

    function onHabitFormSubmit(event){
        event.preventDefault();
        
        let formData = new FormData(this);

        const habit = baseHabitFactory(formData);
        Model.habits.push(habit);
        generateTodayDialogs();
    }

    const habitGenerator = (function(){

        function generateDialogContent(type){
            const dialog = document.querySelector('#create-habit');
            const dialogContent = dialog.querySelector('.dialog-content');
            const form = dialogContent.querySelector("form");

            form.innerHTML = `
                <input type="hidden" name="type" value="${type}">
                <input type="color" name="color">
            `

            switch(type){
                case "positiveYN":
                    generatePositiveYN(form);
                    break;
                case "negativeYN":
                    generateNegativeYN(form);
                    break;
                case "positiveNumerical":
                    generatePositiveNumerical(form);
                    break;
                case "negativeNumerical":
                    generateNegativeNumerical(form);
                    break;
            }

            form.innerHTML += `
                <div class="frequency">
                    <label for="everyday">Everyday</label>
                    <input type="radio" name="frequency" id="everyday" value="everyday">

                    <label for="times-a-week">Some times per week</label>
                    <input type="radio" name="frequency" id="times-a-week" value="times-a-week">
                    <label for="every-each-day">Every some day</label>
                    <input type="radio" name="frequency" id="every-each-day" value="every-each-day">
                </div>
                <label for="startShowHour">Show from</label>
                <input type="time" name="startShowHour" id="startShowHour">
                <label for="endShowHour">to</label>
                <input type="time" name="endShowHour" id="endShowHour">
                <input type="submit" name="submit" value="test">
            `

            form.addEventListener('submit',onHabitFormSubmit);
            dialogContent.append(form);
        }

        function generatePositiveYN(container){
            container.innerHTML += `
                <label for="title">Name</label>
                <input type="text" name="title" id="title" placeholder="e.g. Exercise">
                <label for="description">Description</label>
                <input type="text" name="description" id="description" placeholder="e.g. Did I exercise today">
            `
        }

        function generateNegativeYN(container){
            container.innerHTML += `
                <label for="title">Name</label>
                <input type="text" name="title" id="title" placeholder="e.g. Fast Food">
                <label for="description">Description</label>
                <input type="text" name="description" id="description" placeholder="e.g. Did I eat fast food today?">
            `
        }

        function generatePositiveNumerical(container){

        }

        function generateNegativeNumerical(container){

        }

        return {generateDialogContent};
    })();

    function generateTodayDialogs(){
        const container = document.querySelector(".habitsList");
        //container.innerHTML = "";

        for(let habit in Model.habits){
            const habitDiv = document.createElement('div');

            habitDiv.innerHTML = `
                <div>Lool</div>
            `

            container.append(habitDiv);
        }
    }

    function generateHabitDialog(dialogElement, event){
        habitGenerator.generateDialogContent(event.currentTarget.value);
    }

    return {generateMobileHeader,generateTodayDialogs,createHabitCreatorDialog,createHabitPickerDialog};
})();

DOMController.generateMobileHeader();
DOMController.createHabitPickerDialog();
DOMController.createHabitCreatorDialog();
DOMController.generateTodayDialogs();
