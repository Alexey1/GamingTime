import { autoinject } from 'aurelia-dependency-injection';
import { Project, ProjectItem, CLIOptions, UI } from 'aurelia-cli';

@autoinject()
export default class CElGenerator {
    constructor(private project: Project, private options: CLIOptions, private ui: UI) { }

    execute() {
        return this.ui
            .ensureAnswer(this.options.args[0], 'What would you like to call the new item?')
            .then(name => {
                let fileName = this.project.makeFileName(name);
                let className = this.project.makeClassName(name);

                this.project.elements.add(
                    ProjectItem.text(`${fileName}.ts`, this.generateJSSource(className)),
                    ProjectItem.text(`${fileName}.html`, this.generateHTMLSource(fileName)),
                    ProjectItem.text(`${fileName}.styl`, this.generateStylusSource())
                );

                return this.project.commitChanges()
                    .then(() => this.ui.log(`Created ${fileName}.`));
            });
    }

    generateJSSource(className) {
        return `import {bindable, autoinject} from 'aurelia-framework';

@autoinject
export class ${className} {
}
`;
    }

    generateHTMLSource(fileName) {
        return `<template>
  <require from="./${fileName}.css"></require>
</template>`;
    }

    generateStylusSource() {
        return ` `;
    }
}

