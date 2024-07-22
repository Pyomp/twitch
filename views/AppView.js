export class AppView {
    htmlElement = document.createElement('div')

    /** @type {HTMLSpanElement[]} */ spans = []

    constructor() {
        for (let i = 0; i < 5; i++) {
            this.spans.push(document.createElement('span'))
        }

        this.htmlElement.style.display = 'flex'
        this.htmlElement.style.flexDirection = 'column'

        document.body.appendChild(this.htmlElement)
    }

    pushNotification(text) {
        const span = this.spans.pop()

        span.textContent = text

        this.spans.unshift(span)

        this.htmlElement.appendChild(span)
    }
}
