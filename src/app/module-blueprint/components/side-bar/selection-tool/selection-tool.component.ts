import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TileInfo } from '../../../common/tile-info';
import { TemplateItem } from '../../../common/template/template-item';
import { ToolType } from '../../../common/tools/tool';
import { Template } from '../../../common/template/template';
import { Vector2 } from '../../../common/vector2';
import { Camera } from '../../../common/camera';
import { BlueprintService } from '../../../services/blueprint-service';
import { ToolService } from '../../../services/tool-service';
import { IObsTemplateItemChanged } from '../../../common/tools/select-tool';

@Component({
  selector: 'app-selection-tool',
  templateUrl: './selection-tool.component.html',
  styleUrls: ['./selection-tool.component.css']
})
export class ComponentSideSelectionToolComponent implements OnInit, IObsTemplateItemChanged {

  activeIndex : number;
  templateItemsToShow: TemplateItem[];


  constructor(private cd: ChangeDetectorRef, private blueprintService: BlueprintService, private toolService: ToolService) 
  { 
    this.templateItemsToShow = [];
  }

  ngOnInit() {
    this.toolService.selectTool.subscribe(this);
  }

  newSelection()
  {
    this.activeIndex = 0;
    this.cd.detectChanges();
  }

  nextSelection()
  {
    this.activeIndex++;
    this.activeIndex = this.activeIndex % this.toolService.selectTool.templateItemsToShow.length;
  }

  destroyTemplateItem()
  {
    this.cd.detectChanges();
  }
}