interface TooltipData {
    tooltip: string,
    target: HTMLElement,
    position: string | undefined,
    className: string | undefined
}

interface Config {
    data: Array<TooltipData> | undefined,
    template: Function | undefined,
    position: string | undefined,
    className: string | undefined,
    container: HTMLElement | undefined
}

export class Tooltips {
    
    config: any;
    tooltipElem: HTMLElement;
    activeTooltip: TooltipData;
    
    Defaults(config: any) {
        return {
            data: config?.data || [],
            template: config?.template || function(tooltipText: string) { return `<div class="wbn-tooltip-content">${tooltipText}</div>` }, 
            position: config?.position || 'auto',
            className: config?.className || null,
            container: config?.container || document.body
        }    
    }

    constructor(config?: any) {
        Object.assign(this,{
            config: this.Defaults(config || {})
        });
        this.createTooltip()
            .getTooltipsFromDOM()
            .wireUpDOMEvents();
        
    }
    
    createTooltip() {
        const { ...c } = this.config;
        const tooltipElem = document.createElement('div');
        tooltipElem.classList.add('wbn-tooltip');
        if (c.className) tooltipElem.classList.add(c.className);
        Object.assign(tooltipElem.style,{
            position:'fixed',
            zIndex:2000,
            display:'none',
            whiteSpace:'nowrap',
            opacity:'0',
            transition:'opacity 0.5s ease',
            width:'auto'
        });
        c.container.appendChild(tooltipElem);
        this.tooltipElem = tooltipElem;
        return this;
    }
    
    getTooltipsFromDOM() {
        const { ...c } = this.config;
        const domTooltips = c.container.querySelectorAll('*[wbn-tooltip]');
        var tooltipData: Array<any>; 
        domTooltips.forEach((thisTooltip) => {
             const tooltipString = thisTooltip.getAttribute('wbn-tooltip');
             c.data.push({
                tooltip: tooltipString,
                target: thisTooltip,
                position: 'auto'
            });
        }); 
        return this;
    }
    
        
    targetRect() {
        return this.activeTooltip.target.getBoundingClientRect();
    }
    
    tooltipRect() {
        return this.tooltipElem.getBoundingClientRect();
    }
    
    tooltipTop() {
        const [targetRect,tooltipRect,t] = [this.targetRect(),this.tooltipRect(),this];
        const topPosition = targetRect.top - tooltipRect.height;
        const bottomPosition = targetRect.top + targetRect.height + tooltipRect.height;
        if (topPosition - tooltipRect.height < 0) {
            t.topAttribute = 'bottom';
            return bottomPosition;
        } else { 
            t.topAttribute = 'top';
            return topPosition;
        }
    }
    
    tooltipLeft() {
        const [targetRect,tooltipRect,t] = [this.targetRect(),this.tooltipRect(),this];
        const midPosition = targetRect.left + (targetRect.width/2) - (tooltipRect.width/2);
        const rightPosition = targetRect.right - tooltipRect.width;
        const leftPosition = targetRect.left + (targetRect.width/2) - 7;
        if (midPosition - tooltipRect.width < 0) {
            t.leftAttribute = 'left';
            return leftPosition;
        }
        if (midPosition + tooltipRect.width > window.innerWidth - 20) {
            t.leftAttribute = 'right';
            return rightPosition;
        }
        t.leftAttribute = 'mid';
        t.tooltipElem.setAttribute('wbn-position','mid');
        return midPosition;
    }
    
        set topAttribute(position: string) {
        this.tooltipElem.setAttribute('wbn-position-v',position);
    }
    
    set leftAttribute(position: string) {
        this.tooltipElem.setAttribute('wbn-position-h',position);
    }
    
    
    wireUpDOMEvents() {
        const t = this;
        const { ...c } = t.config;
        c.data.forEach((tooltipData) => {
            ['mouseenter','focus'].forEach((event) => {
                tooltipData.target.addEventListener(event,() => {
                    if (tooltipData.target.getAttribute('disabled')) return;
                    t.activeTooltip = tooltipData;
                    t.tooltipElem.innerHTML = c.template(tooltipData.tooltip);
                    t.tooltipElem.style.display = 'block';
                    t.positionTooltip();
                });
            });
            ['mouseleave'].forEach((event) => tooltipData.target.addEventListener(event,(e) => { 
                this.hideTooltip()
                e.stopPropagation();
            }));
        }); 
        
        ['scroll','keydown'].forEach((event) => {
            window.addEventListener(event,(e) => {
                this.hideTooltip();
                e.stopPropagation(); 
            });
        });
    }
    
    hideTooltip() {
        if (!this.tooltipElem) return;
        Object.assign(this.tooltipElem.style,{
            opacity: '0',
            display: 'none'
        });

    }
    
    positionTooltip() {
        Object.assign(this.tooltipElem.style,{
            top: `${this.tooltipTop()}px`,
            left: `${this.tooltipLeft()}px`,
            opacity:'1'
        });
    }
    
    updateTooltip(tooltipString: string) {
        const t = this;
        const { ...c } = t.config;
        t.tooltipElem.style.opacity = '0';
        setTimeout(() => {
            t.tooltipElem.innerHTML = c.template(tooltipString);
            t.positionTooltip();
        },50);
    }
    
    
}