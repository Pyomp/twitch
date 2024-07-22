export class CopyButton {

    htmlElement = document.createElement('button')

    #baseText = 'Copy'
    #copiedText = 'Copy'
    #textToCopy
    constructor({ textToCopy, baseText = 'Copy', copiedText = 'Copied! ' }) {
        this.#textToCopy = textToCopy
        this.#baseText = baseText
        this.#copiedText = copiedText
        this.htmlElement.textContent = baseText

        this.htmlElement.onclick = this.#onClick.bind(this)
    }

    #onClick() {
        const textArea = document.createElement('textarea')
        textArea.value = this.#textToCopy
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
            document.execCommand('copy')
            this.htmlElement.textContent = this.#copiedText
        } catch {

        }
        document.body.removeChild(textArea)
    }



}
