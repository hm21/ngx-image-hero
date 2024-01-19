<h1>angular 9+ image-hero</h1>

<div>

[![npm version](https://badge.fury.io/js/ngx-image-hero.svg)](https://badge.fury.io/js/ngx-image-hero)
[![NPM monthly downloads](https://img.shields.io/npm/dm/ngx-image-hero.svg)](https://badge.fury.io/js/ngx-image-hero)
[![NPM total downloads](https://img.shields.io/npm/dt/ngx-image-hero.svg)](https://badge.fury.io/js/ngx-image-hero)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/hm21/ngx-image-hero)](https://github.com/hm21/ngx-image-hero/issues)
[![Web Demo](https://img.shields.io/badge/web-demo---?&color=0f7dff)](https://ngx-hm21.web.app/image-hero)
</div>

<img src="https://github.com/hm21/ngx-image-hero/blob/master/assets/showcase.gif?raw=true" width=450 />
<a href="https://ngx-hm21.web.app/image-hero">
      Demo Website
</a>


## Table of contents

- [About](#about)
- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Example](#example)
- [Contributing](#contributing)
- [License](LICENSE)


<h2>About</h2>

A package to implement hero animations, allowing users to click on images and smoothly zoom them into a larger, immersive view, enhancing the user experience and interaction with images.

<h2>Getting started</h2>

### Installation

```sh
npm install ngx-image-hero
```

#### Standalone component
```typescript
import { Component } from '@angular/core';
import { NgxImageHeroModule } from 'ngx-image-hero';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ NgxImageHeroModule ],
})
export class AppComponent {}
```

#### Or for Module
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { NgxImageHeroModule } from 'ngx-image-hero';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxImageHeroModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```


<h2>Documentation</h2>

### Inputs

| Option                   | Type      | Default | Comment                                                                                              |
| :----------------------- | :-------- | :------ | :--------------------------------------------------------------------------------------------------- |
| highQualityPath          | string    |         | The path to the high-quality image or content to be displayed, which seamlessly replaces the current picture when opened. |
| fixedHero                | boolean   | false   | Specifies whether to use the fixed-hero mode when absolute positioning is not effective due to overflow issues. |
| supportedFormats         | string[]  |         | An array of supported image formats, which is only required when using the `<picture>` element where the browser automatically selects the format. |
| browserSupportAvif       | boolean   |         | If you have already manually determined whether the browser supports AVIF, you can set it using this option. Otherwise, the package will automatically perform the check. This option is only required when `supportedFormats` contains values. |
| browserSupportWebP       | boolean   |         | If you have already manually determined whether the browser supports WebP, you can set it using this option. Otherwise, the package will automatically perform the check. This option is only required when `supportedFormats` contains values. |



### Outputs

| Option      | Type                  | Comment                                       |
|:------------|:----------------------|:----------------------------------------------|
| openHero    | EventEmitter\<void\>  | Triggered when the hero animation starts. |
| closeHero   | EventEmitter\<void\>  | Triggered when the hero animation ends.   |

<h2>Example</h2>

#### Simple example
```html
<img ngxHero src="https://picsum.photos/id/200/400" alt="demo-image" />
```

#### Complete example demonstrating all properties
```html
<picture>
  @for (format of imgFormats; track format) {
  <source srcset="assets/img/demo.{{format}}" type="image/{{ format }}" />
  }
  <img
    ngxHero
    fixedHero="false"
    highQualityPath="assets/img/demo_4x"
    browserSupportAvif="supportAvif"
    browserSupportWebP="supportWebP"
    [supportedFormats]="['avif', 'webp', 'jpeg']"
    (openHero)="onOpenHero()"
    (closeHero)="onCloseHero()"
    src="assets/img/demo.jpeg"
    alt="demo-image"
  />
</picture>
```

## Contributing

I welcome contributions from the open-source community to make this project even better. Whether you want to report a bug, suggest a new feature, or contribute code, I appreciate your help.

### Bug Reports and Feature Requests

If you encounter a bug or have an idea for a new feature, please open an issue on my [GitHub Issues](https://github.com/hm21/ngx-image-hero/issues) page. I will review it and discuss the best approach to address it.

### Code Contributions

If you'd like to contribute code to this project, please follow these steps:

1. Fork the repository to your GitHub account.
2. Clone your forked repository to your local machine.

```bash
git clone https://github.com/hm21/ngx-scroll-animations.git
```
