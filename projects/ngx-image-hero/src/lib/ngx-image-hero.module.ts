import { NgModule } from '@angular/core';

import { NgxImageHeroDirective } from './ngx-image-hero.directive';
import { NgxImageHeroService } from './ngx-image-hero.service';
import { ImgManagerService } from './utils/img-manager.service';

@NgModule({
    imports: [],
    exports: [NgxImageHeroDirective],
    declarations: [NgxImageHeroDirective],
    providers: [NgxImageHeroService, ImgManagerService],
})
export class NgxImageHeroModule { }
