import 'Origo';
import readAsync from './readasync';

const LayerAdder = function LayerAdder(options = {}) {
  const {
    layerId,
    cls: clsSettings = 'round compact boxshadow-subtle text-inverse icon-small',
    addIcon = '#ic_add_24px',
    mapIcon = '#ic_map_24px',
    sourceUrl,
    type = 'layer',
    title = 'Lägg till lager',
    src,
    viewer,
    abstract = '',
    layersDefaultProps
  } = options;

  const layer = viewer.getLayer(layerId.split(':').pop());
  const group = viewer.getGroup(layerId.split(':').pop());
  const initialState = layer || group ? 'inactive' : 'initial';
  const initialIcon = initialState === 'initial' ? addIcon : mapIcon;
  const initialBgCls = initialState === 'initial' ? 'primary' : 'grey';
  const initialToolTip = initialState === 'initial' ? 'Lägg till lager' : 'Finns i kartan';
  const cls = `${clsSettings} layeradder ${initialBgCls}`.trim();
  const isValid = src == 'no src' ? 'hidden' : 'visible'; // decides hide or show button, depends if src exist for layer

  const fetchLayer = async function fetchLayer() {
    const body = JSON.stringify([{
      id: layerId,
      type
    }]);
    try {
      const result = await fetch(sourceUrl, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        method: 'POST',
        mode: 'cors',
        body
      }).then(response => response.json());
      return result;
    } catch (err) {
      console.log(err);
    }
  };

  const addSources = function addSources(sources) {
    Object.keys(sources).forEach((sourceName) => {
      viewer.addSource(sourceName, sources[sourceName]);
    });
  };

  const addStyles = function addStyles(styles) {
    Object.keys(styles).forEach((styleName) => {
      viewer.addStyle(styleName, styles[styleName]);
    });
  };

  const initial = function initial() {
    this.setIcon(addIcon);
    this.title = 'Lägg till lager';
    const el = document.getElementById(this.getId());
    el.classList.remove('grey');
    el.classList.add('primary');
  };

  const inactive = function inactive() {
    this.setIcon(mapIcon);
    const el = document.getElementById(this.getId());
    el.children[0].children[0].children[0].innerHTML =  'Finns i kartan';
    el.classList.remove('primary');
    el.classList.add('grey');
  };

  const click = async function click() {
    if (this.getState() === 'initial') {
      this.setState('loading');
      // add layers with same format as in config-json
      let srcUrl = src;
      const abstractText = (abstract == 'no description') ? '' : abstract;
      if (src[src.length - 1] == '?') srcUrl = src.substring(0, src.length - 1); // some extra '?' from request breaks the url
      const legendurl = `${src}service=WMS&version=1.1.0&request=GetLegendGraphic&layer=${layerId}&format=application/json&scale=401`;
      const legendIconUrl = `${src}service=WMS&version=1.1.0&request=GetLegendGraphic&layer=${layerId}&FORMAT=image/png&scale=401&legend_options=dpi:600`;
      let theme = false;
      fetch(legendurl)
        .then((res) => res.json())
        .then((json) => {
		  const value = json.Legend[0]?.rules[0]?.symbolizers[0]?.Raster?.colormap?.entries;
          if ((json.Legend[0].rules.length > 1) || (json.Legend.length > 1)) {theme = true;}
      else if (value) {theme = true;}
          let layer = {
            name: layerId,
            title,
            removable: true,
            source: srcUrl,
            abstract: abstractText,
            style: legendIconUrl,
            theme
          };
          layer = Object.assign(layer, layersDefaultProps);
          const srcObject = {};
          srcObject[`${srcUrl}`] = { url: srcUrl };
          addSources(srcObject);
          const style = [[
            {
              icon: { src: legendIconUrl },
              extendedLegend: theme
            }]];
          viewer.addStyle(legendIconUrl, style);
          viewer.addLayer(layer);
          this.setState('inactive');
        }).catch((err) => {
          let errormsg = viewer.getControlByName('layermanager').getErrorMsg();
          swal("Något gick fel", errormsg, "warning");
        });
    }
  };

  return Origo.ui.Button({
    style: `visibility: ${isValid}`, // hide button if you cant add it
    click,
    title: initialToolTip,
    cls,
    icon: initialIcon,
    iconStyle: {
      fill: '#fff'
    },
    validStates: ['initial', 'inactive'],
    methods: {
      initial,
      inactive
    },
    state: initialState
  });
};

export default LayerAdder;
