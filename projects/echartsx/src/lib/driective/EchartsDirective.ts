import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";

import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { HtmlHelper } from "../internal/HtmlHelper";



@Directive({
    selector: "[echarts]"
})

export class EchartsDirective implements OnInit, OnDestroy, OnChanges {
    @Input() options: object | undefined;
    @Input() extentions: any[] = [];
    @Input() isResizable: boolean = true;

    private _echartsInstance: echarts.ECharts | undefined;

    private _subscription: Subscription | undefined;

    constructor(
        private readonly _el: ElementRef<HTMLElement>
    ) { }

    ngOnInit(): void {
        echarts.use([...this.extentions, CanvasRenderer]);
        this._echartsInstance = echarts.init(this._el.nativeElement, '', {
            width: this._el.nativeElement.clientWidth === 0 ? 400 : undefined,
            height: this._el.nativeElement.clientHeight === 0 ? 400 : undefined
        })
        this._setParams();
        if (this.isResizable) {
            this._addResizbleFunctionality();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.options && !changes.options.firstChange) {
            this._setParams();
        }

        if (changes.isResizable && !changes.isResizable.firstChange) {
            if (this.isResizable) {
                this._addResizbleFunctionality();
            } else {
                if (this._subscription != null) this._subscription.unsubscribe();
            }
        }
    }

    private _addResizbleFunctionality() {
        if (this._subscription != null) this._subscription.unsubscribe();
        this._subscription = HtmlHelper.getWidthSensor(this._el.nativeElement).subscribe(() => {
            if (this._echartsInstance != null) {
                this._echartsInstance.resize();
            }
        });
    }
    private _setParams() {
        if (this._echartsInstance != null && this.options != null)
            this._echartsInstance.setOption({ ...this.options });
    }

    ngOnDestroy(): void {
        if (this._subscription != null) this._subscription.unsubscribe();
    }
}
