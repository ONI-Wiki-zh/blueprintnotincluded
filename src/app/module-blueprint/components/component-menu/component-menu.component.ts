import { Component, OnInit, Output, EventEmitter, Testability } from '@angular/core';

import {MenuItem, Message, MessageService} from 'primeng/api';
import { setDefaultService } from 'selenium-webdriver/opera';
import { ZIndex, Overlay } from '../../common/overlay-type';
import { OniItem } from '../../common/oni-item';
import { ToolType } from '../../common/tools/tool';
import { BlueprintItem } from '../../common/blueprint/blueprint-item';
import { AuthenticationService } from '../../services/authentification-service';
import { Blueprint } from '../../common/blueprint/blueprint';
import { BehaviorSubject } from 'rxjs';
import { ToolService, ToolRequest, IObsToolChanged } from '../../services/tool-service';
import { CameraService, IObsOverlayChanged } from '../../services/camera-service';
import { Router } from '@angular/router';
import { BlueprintService, BlueprintFileType } from '../../services/blueprint-service';
import { DrawHelpers } from '../../drawing/draw-helpers';

@Component({
  selector: 'app-component-menu',
  templateUrl: './component-menu.component.html',
  styleUrls: ['./component-menu.component.css']
})
export class ComponentMenuComponent implements OnInit, IObsToolChanged, IObsOverlayChanged {

  @Output() onMenuCommand = new EventEmitter<MenuCommand>();

  menuItems: MenuItem[];
  overlayMenuItems: MenuItem[];
  toolMenuItems: MenuItem[];

  static debugFps: number = 0
  public getFps() { return ComponentMenuComponent.debugFps; }

  constructor(
    //TODO should not be public
    public authService: AuthenticationService, 
    private messageService: MessageService,
    private toolService: ToolService,
    private cameraService: CameraService,
    private blueprintService: BlueprintService,
    private router: Router) 
  {
    this.toolService.subscribeToolChanged(this);
    this.cameraService.subscribeOverlayChange(this);
  }


  // TODO this causes errors
  get dynamicMenuItems() { 
    let blueprintMenuItems = this.menuItems.find((i) => i.id == 'blueprint').items as MenuItem[];
    blueprintMenuItems.find((i) => i.id == 'save').disabled = !this.authService.isLoggedIn();
    return this.menuItems; 
  }

  ngOnInit() {
    
    let overlayList: Overlay[] = [
      Overlay.Base,
      Overlay.Power,
      Overlay.Liquid,
      Overlay.Gas,
      Overlay.Automation,
      Overlay.Conveyor
    ]

    this.overlayMenuItems = [];
    overlayList.map((overlay) => {
      //this.overlayMenuItems.push({label:'            '+DrawHelpers.overlayString[overlay], id:overlay.toString(), img:DrawHelpers.getOverlayUrl(overlay), command: (event) => { this.clickOverlay(event); }})
      this.overlayMenuItems.push({label:DrawHelpers.overlayString[overlay], id:overlay.toString(), command: (event) => { this.clickOverlay(event); }})
    });

    this.toolMenuItems = [
      {label: 'Select',         id:ToolType[ToolType.select],        command: (event) => { this.clickTool(ToolType.select); }},
      {label: 'Build',          id:ToolType[ToolType.build],         command: (event) => { this.clickTool(ToolType.build); }},
      {separator:true},
      {label: 'Element Report', id:ToolType[ToolType.elementReport], command: (event) => { this.clickTool(ToolType.elementReport); }},
    ];

    this.menuItems = [
      {
        id: 'blueprint',
        label: 'Blueprint',
        items: [
          {label: 'New', icon:'pi pi-plus', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.newBlueprint, data: null}); } },
          {id: 'save', label: 'Save', icon:'pi pi-save', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.saveBlueprint, data: null}); } },
          {label: 'Upload', icon:'pi pi-upload', items:[
            {label: 'Game (yaml)', command: (event) => { this.uploadYamlTemplate(); } },
            {label: 'Blueprint (json)', command: (event) => { this.uploadJsonTemplate(); } },
            {label: 'Blueprint (binary)', command: (event) => { this.uploadBsonTemplate(); } }
          ]},
          {label: 'Browse', icon:'pi pi-search', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.browseBlueprints, data: null}); } },
          {label: 'Get shareable Url', icon:'pi pi-share-alt', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.getShareableUrl, data: null}); } },
          {label: 'Export images', icon:'pi pi-images', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.exportImages, data: null}); } }
        ]
      },
      {
        label: 'Edit',
        items: [
          {label: 'Undo', icon:'pi pi-undo',    command: (event) => { this.blueprintService.undo(); } },
          {label: 'Redo', icon:'pi pi-replay',  command: (event) => { this.blueprintService.redo(); } },
        ]
      },
      {
        label: 'Tools',
        items: this.toolMenuItems
      },
      {
        label: 'Overlay',
        items: this.overlayMenuItems
      }
      ,
      {separator:true},
      {
        label: 'About',
        icon:'pi pi-info-circle', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.about, data: null}); }
      }
      
      ,{
        label: 'Technical',
        items: [
          {label: 'Fetch images',          icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.fetchIcons, data:null}); } },
          {label: 'Download groups',       icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadGroups, data:null}); } },
          {label: 'Download icons',        icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadIcons, data:null}); } },
          {label: 'Download utility',      icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadUtility, data:null}); } },
          {label: 'Repack textures',       icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.repackTextures, data:null}); } }
        ]
      }
      
    ];
   
    
    this.clickOverlay({item:{id:Overlay.Base}});

    this.clickTool(ToolType.select);

  }

  toolChanged(toolType: ToolType) {
    this.updateToolIcon();
  }

  updateToolIcon()
  {
    for (let menuItem of this.toolMenuItems)
    {
      if(!menuItem.separator) {
        if (this.toolService.getTool(ToolType[menuItem.id]).visible) menuItem.icon = 'pi pi-fw pi-check';
        else menuItem.icon = 'pi pi-fw pi-none';
      }
    }   
  }

  clickTool(toolType: ToolType)
  {
    this.toolService.changeTool(toolType);
  }

  userProfile() {
    let userFilter: BrowseData = {
      filterUserId: this.authService.getUserDetails()._id,
      filterUserName: this.authService.getUserDetails().username,
      getDuplicates: true
    }
    
    this.onMenuCommand.emit({type: MenuCommandType.browseBlueprints, data: userFilter});
  }

  overlayChanged(newOverlay: Overlay) {
    this.updateOverlayIcon(newOverlay);
  }

  updateOverlayIcon(overlay: Overlay)
  {
    for (let menuItem of this.overlayMenuItems)
    {
      if (menuItem.id == overlay.toString()) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
  }

  clickOverlay(event: any)
  {
    this.cameraService.overlay = (event.item.id as Overlay);
  }

  uploadYamlTemplate()
  {
    let fileElem = document.getElementById("fileChooser") as HTMLInputElement;
    fileElem.click();
  }

  uploadJsonTemplate()
  {
    let fileElem = document.getElementById("fileChooserJson") as HTMLInputElement;
    fileElem.click();
  }

  uploadBsonTemplate()
  {
    let fileElem = document.getElementById("fileChooserBson") as HTMLInputElement;
    fileElem.click();
  }

  templateUpload(event: any)
  {
    let fileElem = document.getElementById("fileChooser") as HTMLInputElement;
    this.blueprintService.openBlueprintFromUpload(BlueprintFileType.YAML, fileElem.files);
    fileElem.value = '';
  }

  templateUploadJson(event: any)
  {
    let fileElem = document.getElementById("fileChooserJson") as HTMLInputElement;
    this.blueprintService.openBlueprintFromUpload(BlueprintFileType.JSON, fileElem.files);
    fileElem.value = '';
  }

  templateUploadBson(event: any)
  {
    let fileElem = document.getElementById("fileChooserBson") as HTMLInputElement;
    this.blueprintService.openBlueprintFromUpload(BlueprintFileType.BSON, fileElem.files);
    fileElem.value = '';
  }

  login()
  {
    this.onMenuCommand.emit({type: MenuCommandType.showLoginDialog, data: null});
  }

  logout()
  {
    this.authService.logout();
    this.messageService.add({severity:'success', summary:'Logout Successful', detail:null});
  }

}

export enum MenuCommandType
{
  newBlueprint,
  uploadBlueprint,
  uploadYaml,
  changeTool,
  changeOverlay,
  about,

  browseBlueprints,
  saveBlueprint,
  getShareableUrl,
  exportImages,

  fetchIcons,
  downloadIcons,
  downloadGroups,
  downloadUtility,
  repackTextures,


  showLoginDialog
}

export class MenuCommand 
{
  type: MenuCommandType;
  data: any;
}

export interface BrowseData {
  filterUserId: string;
  filterUserName: string;
  getDuplicates: boolean;
}
