import { Component } from '@angular/core';
import { NgxImageHeroModule } from 'ngx-image-hero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgxImageHeroModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  public imgFormats = ['avif', 'webp', 'jpeg'];
  public placeholders = Array(20);
}
