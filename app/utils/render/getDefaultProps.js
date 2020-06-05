import _ from 'lodash';

const GRID = {
  style: { minHeight: '100px', width: '100%', padding: '25px' },
  spacing: 0,
  lg: 12,
  sm: 12,
  md: 12,
  xs: 12,
  container: false,
  item: true,
  form: false,
};

const MAP = {
  style: {
    padding: 20,
    backgroundColor: '#5130a4',
    minWidth: 100,
    minHeight: 100
  },
  cluster: false,
  infoWindow: false,
  width: '100%',
  height: '500px',
  lat: 34.0195,
  lng: -118.4912,
  zoom: 8,
  markerImage: '',
  clusterImage: '',
  infoWindowComponent: '',
};

const IFRAME = {
  style: {
    border: 'none',
    padding: 25,
  },
  width: "100%",
  height: "100%",
  allowPaymentRequest: true,
  allowFullScreen: true,
  src: "https://noco.io",
  name: 'Dropp',
};

const FILEUPLOAD = {
  style: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: "10px",
    margin: "10px",
  },
  message: 'Drop a file or two 🗂!',
  maxFileSize: 500000,
  filesLimit: 10,
  acceptedFiles: "image, video, misc", // ["image/*", "video/*", "application/*"].
};

const RATING = {
  style: {
    minWidth: 100,
    minHeight: 25,
  },
  isIcon: false,
  size: 'medium',
  name: 'Rating',
  max: 5,
  precision: 1,
  icon: 'Star',
  emptyIcon: 'StarBorder',
  value: 2,
  lab: true, // lab elements must have lab true.
  readOnly: false,
  color: 'inherit',
};

const SECTION = {
  style: { minHeight: '100px', width: '100%', padding: '25px' },
  form: false,
};

const DIVIDER = {
  style: { height: '4px', width: '100%', padding: '2px' },
  absolute: false,
  light: false,
  orientation: 'horizontal',
  variant: 'fullWidth',
};

const LIST = {
  style: {},
  dense: false,
  disablePadding: false,
  subheader: "",
  items: [{
    label: "option 1",
    icon: "one",
    button: false,
    alignItems: 'flex-start'
  }, {
    label: 'option 2',
    icon: "two",
    button: false
  }],
};


const CHIP = {
  style: { },
  label: "New Chip",
  size: "medium",
  color: "primary",
  variant: 'default',
};

const ICON = {
  style: { },
  icon: "ThreeDRotation",
  color: "primary",
  fontSize: 'default',
};

const CARD = {
  style: { maxWidth: 345 },
  mediaStyle: {
    height: 0,
    paddingTop: '56.25%',
  },
  mediaSrc: "img",
  mediaURL: "",
  mediaTitle: "",
  cardTitle: "card title",
  cardSubheader: "card subtitle",
  contentText: "content text",
  // collapse: true,
};

const BUTTON = {
  style: {},
  variant: "contained",
  color: "primary",
  size: "medium",
  onClick: () => { },
  text: 'button',
  fullWidth: false,
  formSubmit: false,
};

const STRIPEBUTTON = {
  style: {},
  variant: "contained",
  color: "primary",
  size: "medium",
  onClick: () => { },
  text: 'stripe checkout',
  fullWidth: false,
  formSubmit: false,
};

const AVATAR = {
  style: {
    maxWidth: '100%',
  },
  variant: 'circle',
  name: "Name",
};

const IMAGE = {
  style: {
    maxWidth: '100%',
  },
  src: "/img/logo.png",
};

const VIDEO = {
  style: {
    maxWidth: '100%',
    minWidth: 50,
    minHeight: 50
  },
  src: "https://s3.us-west-1.wasabisys.com/noco/landing/glassdoor_clone.mp4",
  autoPlay: false,
  controls: true,
};

const TYPOGRAPHY = {
  style: { },
  variant: "body1",
  text: "Text",
  noWrap: false,
  paragraph: false,
  color: 'initial',
  align: 'inherit',
};


const CHECKBOX = {
  style: {},
  color: "primary",
  name: "Checkbox",
  items: [{ label: "option 1", value: "one" }, { label: 'option 2', value: "two" }],
};

const DATETIME = {
  style: {},
  name: "Date & Time",
  timeLabel: "Time Picker",
  dateLabel: "Date Picker",
  format: "MM/dd/yyyy",
  showTime: true,
};

const RADIO = {
  style: {},
  name: "Radio",
  items: [{ label: "option 1", value: "one" }, { label: 'option 2', value: "two" }],
};

const SELECT = {
  style: {},
  name: "Select",
  items: [{ label: "option 1", value: "one" }, { label: 'option 2', value: "two" }],
};

const SLIDER = {
  style: {},
  name: "Slider",
  defaultValue: 50,
  step: 1,
  marks: true,
  min: 0,
  max: 100,
  valueLabelDisplay: "on",
  orientation: "horizontal",
};

const SWITCH = {
  style: {},
  name: "Switch",
  size: "medium",
  color: "primary"
};

const TEXTFIELD = {
  style: {},
  fullWidth: false,
  helperText: "Helper Text",
  placeholder: "Placeholder",
  margin: "normal",
  label: "Text Field",
  name: "Text Field",
  color: "primary",
  multiline: false,
  rows: 1,
  rowsMax: 1,
  type: "text",
  variant: "standard"
};

const PAPER = {
  style: { minWidth: '100%', minHeight: 100, padding: '25px' },
  elevation: 1,
  square: false,
};

export default (type) => {
  switch (type) {
    case 'Grid':
      return _.cloneDeep(GRID);
    case 'Section':
      return _.cloneDeep(SECTION);
    case 'Div':
      return _.cloneDeep(SECTION);
    case 'Divider':
      return _.clone(DIVIDER);
    case 'Chip':
      return _.clone(CHIP);
    case 'Icon':
      return _.clone(ICON);
    case 'Button':
      return _.cloneDeep(BUTTON);
    case 'List':
      return _.cloneDeep(LIST);
    case 'Paper':
      return _.cloneDeep(PAPER);
    case 'Image':
      return _.cloneDeep(IMAGE);
    case 'Typography':
      return _.cloneDeep(TYPOGRAPHY);
    case 'Checkbox':
      return _.cloneDeep(CHECKBOX);
    case 'Date/Time':
      return _.cloneDeep(DATETIME);
    case 'Radio':
      return _.cloneDeep(RADIO);
    case 'Select':
      return _.cloneDeep(SELECT);
    case 'Slider':
      return _.cloneDeep(SLIDER);
    case 'Switch':
      return _.cloneDeep(SWITCH);
    case 'Text Field':
      return _.cloneDeep(TEXTFIELD);
    case 'Card':
      return _.cloneDeep(CARD);
    case 'File Upload':
      return _.cloneDeep(FILEUPLOAD);
    case 'Avatar':
      return _.cloneDeep(AVATAR);
    case 'Rating':
      return _.cloneDeep(RATING);
    case 'Map':
      return _.cloneDeep(MAP);
    case 'Video':
      return _.cloneDeep(VIDEO);
    case 'Iframe':
      return _.cloneDeep(IFRAME);
    case 'Stripe Checkout':
      return _.cloneDeep(STRIPEBUTTON);
    default:
      return {};
  }
};
