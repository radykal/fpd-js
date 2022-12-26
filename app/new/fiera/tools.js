
class Tool {
    static counter = 0
    constructor(data){
        this.id = ++Tool.counter
        this.config = data;
        this.createContainer()
        this.create(data)

        if(data.observe){
            data.observe(()=> this.refresh())
        }
        this.refresh()
    }
    createContainer() {
        this.container = document.createElement("div")
        this.container.className = "tool"
        if(this.config.caption){
            this.label = document.createElement("label")
            this.label.innerText = this.config.caption + ":"
            this.container.append(this.label)
        }
        this.inputContainer = document.createElement("div")
        this.container.append(this.inputContainer)
    }
    enable(){
        this.input.disabled = false
    }
    disable(){
        this.input.disabled = "disabled"
        if(this.input.disabled){
            delete this.input.value
        }
    }
    create(){
        this.input = document.createElement("input")
        this.input.type = "button"
        this.input.className = "tool-button"
        this.input.value = this.config.label
        if(this.config.click){
            this.input.addEventListener("click",() => {
                this.config.click()
            })
        }
        this.inputContainer.append(this.input)
    }
    update(value){
        this.input.value = value
    }
    refresh(){
        let enabled = true;

        if (this.config.enabled) {
            if (this.config.enabled()) {
                enabled = true;
                if (this.isDisabled) {
                    delete this.isDisabled
                    this.enable()
                }
            } else {
                enabled = false;
                if (!this.isDisabled) {
                    this.isDisabled = true
                    this.disable()
                }
            }
        }
        if(enabled && this.config.value){
            let value = this.config.value()
            this.update(value)
        }
    }
}

class SelectTool extends Tool {
    create (data) {
        this.input = document.createElement("select")

        if(data.placeholder){
            let optionElement = document.createElement("option");
            optionElement.value = "";
            optionElement.disabled = true
            optionElement.selected = true
            optionElement.hidden = true
            optionElement.text = data.placeholder;
            this.input.appendChild(optionElement);
        }

        if(data.options.constructor === Function){
            data.options = data.options()
        }
        for (let i in data.options) {
            let option = data.options[i]
            if(option.constructor === String){
                let optionElement = document.createElement("option");
                optionElement.value = i;
                optionElement.text = option;
                this.input.appendChild(optionElement);
            }
            else{
                let optionElement = document.createElement("option");
                optionElement.value = i;
                optionElement.text = option.label
                this.input.appendChild(optionElement);
            }
        }
        this.input.addEventListener("change", () => {
            this.change()
        })
        this.inputContainer.append(this.input)
    }
    update(value){
        this.input.value = this.config.options.indexOf(value)
    }
    change(){
        let option = this.config.options[this.input.value]
        this.config.change(option.constructor === String ? option: option.value)
    }
}

class DropdownTool extends SelectTool {
    create (data) {
        SelectTool.prototype.create.call(this,data)
        this.input.className = "tool-button"
    }
    change(){
        let option = this.config.options[this.input.value]
        this.config.change(option.constructor === String ? option: option.value)
        this.input.value = ""
    }
}


class RangeTool extends Tool {
    create(data){
        this.input = document.createElement("input")
        this.input.type = "range"
        this.input.min = data.min
        this.input.max = data.max
        this.input.addEventListener("input",() => {
            data.change(parseFloat(this.input.value))
        })
        this.inputContainer.append(this.input)
    }
}

class CheckboxRangeTool extends Tool {
    create(data){
        this.range = document.createElement("input")
        this.range.type = "range"
        this.range.min = data.min
        this.range.max = data.max
        this.range.addEventListener("input",() => {
            data.change(parseFloat(this.range.value))
        })

        this.checkbox = document.createElement("input")
        this.checkbox.type = "checkbox"
        this.checkbox.addEventListener("click", () => {
            let value;
            if(this.checkbox.checked && data.on !== undefined){
                value = data.on()
            }
            else if(!this.checkbox.checked && data.off !== undefined){
                value = data.off()
            }
            else{
                value = this.checkbox.checked
            }
            data.change(value)
        })
        this.inputContainer.append(this.checkbox,this.range)

    }
    update(value){
        this.range.value = value
        this.checkbox.checked = value !== undefined ? !!value : false
    }
    enable(){
        this.range.disabled = false
        this.checkbox.disabled = false
    }
    disable(){
        this.range.disabled = true
        this.checkbox.disabled = true
        delete this.range.value
        delete this.checkbox.value
    }
}

class NumberTool extends Tool {
    create(data){
        this.input = document.createElement("input")
        this.input.type = "number"
        this.input.min = data.min
        this.input.max = data.max
        this.input.addEventListener("input",() => {
            data.change(parseFloat(this.input.value))
        })
        this.inputContainer.append(this.input)
    }
}

class ColorTool extends Tool {
    create(data){
        this.input = document.createElement("input")
        this.input.type = "color"
        this.input.addEventListener("input",() => {
            data.change(this.input.value)
        })
        this.inputContainer.append(this.input)
    }
    update(value) {
        if (value !== undefined) {
            if(value.constructor === String){
                let c = new fabric.Color(value);
                this.input.value = "#" + c.toHex()
            }
        } else {
            delete this.input.value
        }
    }
}

class CheckboxTool extends Tool {
    create(data) {
        this.input = document.createElement("input")
        this.input.type = "checkbox"
        this.input.hidden = true
        this.input.addEventListener("click", () => {
            data.change(this.input.checked)
        })
        this.label = createLabel(data)
        this.label.prepend(this.input)
        this.inputContainer.append(this.label)
    }
    update(value) {
        this.input.checked = value !== undefined ? !!value : false
    }
}
function createLabel(options){
    let labelEl = document.createElement("label")
    if(options.svg){
        let span = document.createElement("span")
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.innerHTML =`<path d="${options.svg}"/>`
        document.body.append(svg)
        let size = svg.getBBox()
        document.body.removeChild(svg)
        svg.setAttribute ("viewBox", `${0} ${0} ${size.width + size.x*2} ${size.height+ size.y*2}` );
        span.append(svg)
        span.className = options.lblClass
        // span.className = "tool-button-icon"
        labelEl.append(span)
    }

    if(options.label || options.lblClass){
        let span = document.createElement("span")
        if(options.label){
            span.innerText = options.label
        }
        if(options.lblClass){
            span.className = options.lblClass
        }
        // span.className = "tool-button"
        labelEl.append(span)
    }
    return labelEl
}

class OptionsTool extends Tool {
    create(data){
        if(data.options.constructor === Function){
            data.options = data.options()
        }
        for(let option of data.options){
            if(option.constructor === String){
                option = {
                    label: option,
                    value: option,
                    class: ""
                }
            }
            let label = createLabel(option)
            let radio = document.createElement("input")
            radio.hidden = true
            radio.type = "radio"
            radio.value = option.value
            radio.name = "options-tool-"+this.id
            radio.addEventListener("click", () => {
                data.change(radio.value)
            })
            label.prepend(radio)

            this.inputContainer.append(label)
        }
    }
    update(value) {
        let el = this.inputContainer.querySelector(`input[value=${value}]`)
        if(el){
            el.checked = value !== undefined ? !!value : false
        }
    }
    enable() {
        this.inputContainer.querySelectorAll(`input`).forEach(i => {
            i.disabled = false
        })
    }
    disable(){
        this.inputContainer.querySelectorAll(`input`).forEach(i => {
            i.disabled = true
            i.checked = false
        })
    }
}

class GroupTool extends Tool {
    create(data){
        for(let toolOptions of data.tools){
            let tool = new tools[toolOptions.type](toolOptions)
            this.inputContainer.append(tool.container)
        }
    }
    update(value) {}
    enable() {}
    disable(){}
}


let tools = {
    button: Tool,
    select: SelectTool,
    dropdown: DropdownTool,
    checkbox: CheckboxTool,
    range: RangeTool,
    crange: CheckboxRangeTool,
    number: NumberTool,
    color: ColorTool,
    options: OptionsTool,
    group: GroupTool
}

export function createTools(options){
    for(let toolOptions of options.tools){
        let tool = new tools[toolOptions.type](toolOptions)
        let toolsContainer = document.getElementById(options.container)
        toolsContainer.append(tool.container)
    }
}