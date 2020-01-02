import { Component, OnInit, Input } from '@angular/core';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';
import { DrawHelpers } from 'src/app/module-blueprint/drawing/draw-helpers';

@Component({
  selector: 'app-element-icon',
  templateUrl: './element-icon.component.html',
  styleUrls: ['./element-icon.component.css']
})
export class ElementIconComponent implements OnInit {

  @Input() element: BuildableElement;
  @Input() width: string;
  @Input() height: string;

  // TODO boolean in export
  get isIcon() { return !this.element.hasTag('Gas') && !this.element.hasTag('Liquid'); }
  get nullIcon() { return this.element.icon == null; }
  get isLiquid() { return this.element.hasTag('Liquid'); }
  get isGas() { return this.element.hasTag('Gas'); }
  get tint() { return DrawHelpers.colorToHex(this.element.uiColor); }


  constructor() { }

  ngOnInit() {
  }

}
