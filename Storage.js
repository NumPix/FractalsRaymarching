export class Storage extends EventTarget {
    #downloads_needed;
    #number_retrieved;
    #data;

    constructor(shader_list) {
        super();

        this.#downloads_needed = shader_list.length;
        this.#number_retrieved = 0;

        this.#data = new Map();

        shader_list.forEach(file => {
            $.get(file, (data) => {
                this.#data.set(file, data);
                ++this.#number_retrieved;

                this.#triggerOnFilesLoaded();
            })
        });
    }   

    #triggerOnFilesLoaded() {
        if (this.#number_retrieved >= this.#downloads_needed) {
            this.dispatchEvent(new CustomEvent("onFilesLoaded", { }));
        }
    }

    get(file) {
        return this.#data.get(file);
    }
}