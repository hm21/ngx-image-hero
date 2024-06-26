import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxImageHeroDirective } from 'ngx-image-hero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgxImageHeroDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  public imgFormats = ['avif', 'webp', 'jpeg'];
  public placeholders = Array(20);
}
