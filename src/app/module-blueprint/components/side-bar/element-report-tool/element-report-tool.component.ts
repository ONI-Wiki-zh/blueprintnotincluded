import { Component, OnInit } from '@angular/core';
import { ToolService } from 'src/app/module-blueprint/services/tool-service';
import { BuildableElement } from 'src/app/module-blueprint/common/bexport/b-element';

@Component({
  selector: 'app-element-report-tool',
  templateUrl: './element-report-tool.component.html',
  styleUrls: ['./element-report-tool.component.css']
})
export class ElementReportToolComponent implements OnInit {

  get data() { return this.toolService.elementReportTool.data }

  constructor(private toolService: ToolService) { }

  getMass(m: number): string {
    if (m < 5000) return m + ' Kg';
    else return (m / 1000).toFixed(1) + ' Tons';
  }

  selectEveryElement(buildableElement: BuildableElement) {
    this.toolService.selectTool.selectEveryElement(buildableElement);
  }

  ngOnInit() {
  }

}