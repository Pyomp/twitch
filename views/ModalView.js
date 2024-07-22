export class ModalView {

    static zIndex = 1000

    #htmlElement = document.createElement('div')


    constructor({ element }) {
        const style = this.#htmlElement.style
        style.position = 'fixed'
        style.zIndex = '' + ModalView.zIndex++

        style.width = '100%'
        style.height = '100%'

        style.display = 'flex'
        style.justifyContent = 'center'
        style.alignItems = 'center'

        this.#htmlElement.appendChild(element)

        document.body.appendChild(this.#htmlElement)
    }

    dispose() {
        ModalView.zIndex--
        this.#htmlElement.remove()
    }
}
