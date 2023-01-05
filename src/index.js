import A11yDialog from "a11y-dialog";
import "normalize.css";
import "./main.scss";
import {parse,format,isToday,addDays,subDays} from "date-fns";

const DATE_AS_KEY_FORMAT = "yyyyMMdd";
const DAYS_TO_SHOW = 7;

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

const habitsController = (function(){
    function changeHabitState(event){
        const habit = Model.habits[event.target.parentElement.dataset.index];
        
        if(event.target.checked){
            habit.markedDays[format(new Date(),DATE_AS_KEY_FORMAT)] = true;
        } else {
            delete habit.markedDays[format(new Date(),DATE_AS_KEY_FORMAT)];
        }

        Model.saveToLocalStorage();
        console.log(habit.markedDays);
    }

    return {changeHabitState};
})();

const Model = (function() {

    const HABITS_KEY = "HABITS"

    let habits;
    let selectedDate = parse(format(new Date(),DATE_AS_KEY_FORMAT),DATE_AS_KEY_FORMAT,new Date());

    console.log(selectedDate);

    if(localStorage.getItem(HABITS_KEY)){
        habits = JSON.parse(localStorage.getItem(HABITS_KEY));
    } else {
        habits = [];
    }
    console.log("readFromStorage =",habits);

    function saveToLocalStorage(){
        localStorage.setItem(HABITS_KEY,JSON.stringify(habits));
    }

    return {habits,selectedDate,saveToLocalStorage};
})();

const DOMController = (function(){
    function htmlToElements(html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.childNodes;
    }

    function generateMobileHeader(){
        const header = document.querySelector('nav');

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
        Model.saveToLocalStorage();

        generateTodayHabits();
    }

    function generateTodayPage(){

        setSelectedDate();
        generateDaysList();
        generateTodayHabits();
    }

    function setSelectedDate(){

        const header = document.querySelector('.today-page > header');

        let h1 = header.querySelector('h1');

        if(!h1){
            h1 = document.createElement("h1");
            header.append(h1);
        }

        if(isToday(Model.selectedDate)){
            h1.textContent = `Today`;
        } else {
            h1.textContent = `${format(Model.selectedDate,"yyyy.MM.dd")}`;
        }
    }

    function generateDaysList(){
        const header = document.querySelector('.today-page > header');
        let daysList = header.querySelector(".days-list");

        if(!daysList){
            daysList = document.createElement('div');
            daysList.classList.add("days-list");
            header.append(daysList);
        } else {
            daysList.innerHTML = "";
        }

        for(let i = 0; i < DAYS_TO_SHOW; i++){
            const day = addDays(subDays(Model.selectedDate,DAYS_TO_SHOW-1),i);

            const dayDiv = document.createElement('div');
            dayDiv.classList.add("day");
            dayDiv.dataset.date = format(day,DATE_AS_KEY_FORMAT);

            dayDiv.innerHTML = `
            <div>${format(day,"eee")}</div>
            <div>${format(day,"d")}</div>
            `

            dayDiv.addEventListener('click',onSelectDate);

            daysList.append(dayDiv);
        }
    }

    function generateTodayHabits(){
        const container = document.querySelector(".habitsList");
        container.innerHTML = "";
        let index = 0;

        console.log("generatePage =",Model.habits);
        Model.habits.forEach(habit => {

            if(true){
                const habitDiv = document.createElement('div');
                habitDiv.classList.add("habit");
                habitDiv.dataset.index = index;
    
                habitDiv.innerHTML = `
                <div class="title" style="color:${habit.DOMdata.color};">${habit.DOMdata.title}</div>
                <input type="checkbox" name="marked">
                `
    
                const checkbox = habitDiv.querySelector('input[type="checkbox"]');

                checkbox.addEventListener('click',habitsController.changeHabitState);
                checkbox.checked = habit.markedDays[format(new Date(),DATE_AS_KEY_FORMAT)];
                container.append(habitDiv);
            }
            
            index++;
        });
    }

    function onSelectDate(event){
        const previousSelection = document.querySelector(`.days-list [data-date="${format(Model.selectedDate,DATE_AS_KEY_FORMAT)}"]`);
        previousSelection.classList.remove('selected');

        Model.selectedDate = parse(event.currentTarget.dataset.date,DATE_AS_KEY_FORMAT,new Date());
        const currentSelection = document.querySelector(`.days-list [data-date="${format(Model.selectedDate,DATE_AS_KEY_FORMAT)}"]`);
        currentSelection.classList.add('selected');

        console.log(Model.selectedDate);
        setSelectedDate();
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

    function generateHabitDialog(dialogElement, event){
        habitGenerator.generateDialogContent(event.currentTarget.value);
    }

    return {generateMobileHeader,
        generateTodayPage,
        generateTodayHabits,
        createHabitCreatorDialog,
        createHabitPickerDialog,
        onSelectDate
    };
})();

DOMController.generateMobileHeader();
DOMController.createHabitPickerDialog();
DOMController.createHabitCreatorDialog();
DOMController.generateTodayPage();

DOMController.onSelectDate({currentTarget: {dataset: {date: format(Model.selectedDate,DATE_AS_KEY_FORMAT)}}})