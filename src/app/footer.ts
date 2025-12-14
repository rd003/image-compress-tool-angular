import { Component } from "@angular/core";

@Component({
    selector: 'app-footer',
    template: `
    <div class="footer">
        Created by <a target="_blank" href="https://x.com/ravi_devrani">Ravindra Devrani</a> with <a href="https://angular.dev/" target="_blank">angular</a> and <a
            target="_blank" href="https://github.com/Donaldcwl/browser-image-compression">browser-image-compression</a>
    </div>
    `,
    imports: [],
    styles: [`
        .footer {
    padding: 1rem;
}

.footer a {
    color: black;
    cursor: pointer;
}
        `],
})
export class Footer {

}