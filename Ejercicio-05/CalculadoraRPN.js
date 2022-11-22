"use strict";
class CalculadoraRPN {

    constructor (){
        this.mem = Number(0);
        this.currentNumber = "0";
        this.stack = new Array();
        this.wrapFunctions = true;

        this.hypActive = false;
        this.shiftActive = false;
        this.units = "DEG";
    }

    // NUMBERS

    digitos(n){
        this.addToNumber(n);
    }
    punto(){
        this.addToNumber(".");
    }
    pi() {
        this.updateNumber(String(Math.PI));
    }

    // CHANGE STATE

    shift() {
        this.shiftActive = !this.shiftActive;
        this.updateTrigonometricFunctions();
    }
    hyp() {
        this.hypActive = !this.hypActive;
        this.updateTrigonometricFunctions();
    }
    mc(){
        this.mem = Number(0); 
    }
    mr() {
        this.updateNumber(String(this.mem));
    }
    mMenos(){
        try {
            this.mem -= Number(this.currentNumber);
        } catch(ex) {
            this.handleError(ex);
        }
    }
    mMas(){
        try {
            this.mem += Number(this.currentNumber);
        } catch(ex) {
            this.handleError(ex);
        }
    }
    /**
     * Clears the current operand.
     */
     clearEntry(){
        this.updateNumber("0");
    }
    /**
     * Resets the calculator to its initial state.
     */
    borrar(){
        this.stack = new Array();
        this.currentNumber = "0";
        this.wrapFunctions = true;
        this.shiftActive = false;
        this.hypActive = false;
        this.updateScreen();
        this.updateInput();
    }

    // BINARY OPERATIONS

    suma(){
        if (this.wrapFunctions) return this.wrap(this.suma);

        var b = this.pop();
        var a = this.pop();
        return a + b;    
    }
    resta(){
        if (this.wrapFunctions) return this.wrap(this.resta);

        var b = this.pop();
        var a =  this.pop();
        return a - b; 
    }
    multiplicacion(){
        if (this.wrapFunctions) return this.wrap(this.multiplicacion);

        var b = this.pop();
        var a = this.pop();
        return a * b;   
    }
    division(){
        if (this.wrapFunctions) return this.wrap(this.division);

        var b = this.pop();
        var a = this.pop();
        return a / b;  
    }
    power(){
        if (this.wrapFunctions) return this.wrap(this.power);

        var b = this.pop();
        var a = this.pop();
        return a ** b;  
    }
    
    // UNARY OPERATIONS

    sin() {
        if (this.wrapFunctions) return this.wrap(this.sin);
        return this.trigonometricFunction("sin");
    }
    cos() {
        if (this.wrapFunctions) return this.wrap(this.cos);
        return this.trigonometricFunction("cos");
    }
    tan() {
        if (this.wrapFunctions) return this.wrap(this.tan);
        return this.trigonometricFunction("tan");
    }
    trigonometricFunction(baseName) {
        var functionName = this.getTrigonometricFunctionName(baseName);
        var arg = this.toRadians(this.pop());

        return Math[functionName](arg);
    }
    raiz(){ 
        if (this.wrapFunctions) return this.wrap(this.raiz);

        var a = this.pop();
        return Math.sqrt(a);  
    }
    factorial(){ 
        if (this.wrapFunctions) return this.wrap(this.factorial);

        var a = this.pop();
        return this.factorialRec(a);  
    }
    log() {
        if (this.wrapFunctions) return this.wrap(this.log);

        var a = this.pop();
        return Math.log10(a);  
    }
    exp() {
        if (this.wrapFunctions) return this.wrap(this.exp);

        var a = this.pop();
        return Math.exp(a);  
    }
    cambioDeSigno() {
        if (this.wrapFunctions) return this.wrap(this.cambioDeSigno);

        var a = this.pop();
        return -a;  
    }
    
    // EXCEPTION HANDLING

    /**
     * Wraps an operation, updating the screen with its result
     * and catching exceptions.
     * @param {Function} f the operation to be wrapped
     */
    wrap(f) {
        this.wrapFunctions = false;
        try {
            var result = f.bind(this)();
            this.checkValidNumber(result);
            this.push(result);
        } catch(ex) {
            this.handleError(ex);
        }
        this.wrapFunctions = true;
    }
    checkValidNumber(n) {
        if (Number.isNaN(n) || !Number.isFinite(n)) {
            throw "MATH ERROR";
        }
    }
    /**
     * Resets the calculator and displays an error message on the screen.
     * @param {String} ex the error found
     */
     handleError(ex) {
        this.borrar();
        document.querySelector("textarea").value = ex;
    }

    // FACTORIAL

    factorialRec(n) {
        if (n < 0) throw "MATH ERROR";
        if (n < 2) return 1;
        try {
            return n * this.factorialRec(n - 1);
        } 
        catch(ex) {
            throw "MATH ERROR";
        }  
    }

    // TRIGONOMETRIC
    
    toRadians(n) {
        if (this.isSetToRadians()) {
            return n;
        } else if(this.units == "DEG") {
            return Number(n * Math.PI / 180.0);
        } else {
            return Number(n * Math.PI / 200.0);
        }
    }
    isSetToRadians() {
        return this.units == "RAD";
    }
    changeUnits() {
        if (this.isSetToRadians()) {
            this.units = "GRAD";
        } else if(this.units == "GRAD") {
            this.units = "DEG";
        } else {
            this.units = "RAD";
        }
        document.querySelector("input[name=units]").value = this.units;
    }
    updateTrigonometricFunctions() {
        document.querySelector("input[name=sin]").value = this.getTrigonometricFunctionName("sin");
        document.querySelector("input[name=cos]").value = this.getTrigonometricFunctionName("cos");
        document.querySelector("input[name=tan]").value = this.getTrigonometricFunctionName("tan");
    }
    /**
     * Generates the name of the function to be evaluated depending on the
     * state of shift and hyp buttons.
     * shift --> inverse of the given function
     * hyp   --> hyperbolic function
     * @param {String} base the base name of the function (sin, cos or tan)
     * @returns the name of the function to be evaluated
     */
    getTrigonometricFunctionName(base) {
        var f = base;
        if (this.shiftActive) {
            f = "a" + f;
        }
        if (this.hypActive) {
            f += "h";
        }
        return f;
    }

    // STACK

    push(number=this.currentNumber) {
        try {
            this.stack.push(Number(number));
            this.updateNumber("0");
            this.updateScreen();
        } catch(ex) {
            this.handleError(ex);
        }
    }
    pop() {
        if (this.stack.length <= 0) throw "ERROR: Not enough operands";
        return this.stack.pop();
    }

    // UPDATE CURRENT OPERAND

    /**
     * Adds a character (digit or point) to the current operand.
     * If a point is added when the operand already contains one, it won't be updated.
     * @param {String} c the new character in the screen
     */
    addToNumber(c) {
        if (!(c=="." && this.currentNumber.includes("."))) {
            this.updateNumber(this.currentNumber + c);
        }  
    }
    /**
     * Sets the current operand to the given value.
     * @param {String} value the new value for the current operand
     */
    updateNumber(value) {
        this.currentNumber = this.removeLeadingZeros(value);
        this.updateInput();
    }
    /**
     * Formats the given number removing leading zeros.
     * @param {String} value the current value displayed on the screen
     * @returns value without useless zeros at the left
     */
    removeLeadingZeros(value) {
        if (value == '.') {
            return "0.";
        }
        if (this.currentNumber == "0" && !String(value).endsWith(".")) {
            return String(Number(value));
        }
        return value;
    }  

    // INPUT - OUTPUT

    /**
     * Updates the value displayed on the screen.
     */
    updateScreen() {
        var pantalla = "";
        for (var i in this.stack) {
            pantalla += this.stack[i] + "\n";
        }
        document.querySelector("textarea").value = pantalla;
    }
    /**
     * Updates the value displayed on the input text field.
     */
     updateInput() {
        document.querySelector("input[type=text]").value = this.currentNumber;
    }
    /**
     * Calls a function depending on the key pressed.
     * @param {String} key the key pressed
     */
    readKey(key) {
        if (key >= '0' && key <= '9') {
            this.digitos(key);
        } else if (key == '.') {
            this.punto();
        } else if (key == '+') {
            this.suma();
        } else if (key == '-') {
            this.resta();
        } else if (key == '*') {
            this.multiplicacion();
        } else if (key == '/') {
            this.division();
        } else if (key == 'r') {
            this.raiz();
        } else if (key == '/') {
            this.division();
        } else if (key == 'b') {
            this.mMas();
        } else if (key == 'n') {
            this.mMenos();
        } else if (key == 'm') {
            this.mr();
        } else if (key == 'v') {
            this.mc();
        } else if (key == 'Backspace') {
            this.clearEntry();
        } else if (key == 'Escape') {
            this.borrar();
        } else if (key == '¡') {
            this.cambioDeSigno();
        } else if (key == 'Enter') {
            this.push();
        } else if (key == 'Shift') {
            this.shift();
        } else if (key == 'h') {
            this.hyp();
        } else if (key == 's') {
            this.sin();
        } else if (key == 'c') {
            this.cos();
        } else if (key == 't') {
            this.tan();
        } else if (key == 'p') {
            this.power();
        } else if (key == 'e') {
            this.exp();
        } else if (key == 'l') {
            this.log();
        } else if (key == 'f') {
            this.factorial();
        } else if (key == 'u') {
            this.changeUnits();
        } else if (key == 'i') {
            this.pi();
        }
    }
}

var calc = new CalculadoraRPN();

document.addEventListener('keydown', function(event) {
    calc.readKey(event.key);
});