// uncomment for prod
import * as mui from '@material-ui/icons';

/* start uncomment for dev */
// import Menu from '@material-ui/icons/Menu';
// import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
// import ThumbUp from '@material-ui/icons/ThumbUp';
// import Delete from '@material-ui/icons/Delete';
// import ThumbDown from '@material-ui/icons/ThumbDown';
// import Star from '@material-ui/icons/Star';
// import StarBorder from '@material-ui/icons/StarBorder';
// import StarHalf from '@material-ui/icons/StarHalf';
//
// const mui = {
//   ThumbUp,
//   Menu,
//   Delete,
//   ThreeDRotation,
//   ThumbDown,
//   Star,
//   StarBorder,
//   StarHalf
// };
// /* End uncomment for dev */

const allIconsMap = {};
Object.keys(mui)
  .sort()
  .map(key => {
    let tag;
    if (key.indexOf('Outlined') !== -1) {
      tag = 'Outlined';
    } else if (key.indexOf('TwoTone') !== -1) {
      tag = 'Two tone';
    } else if (key.indexOf('Rounded') !== -1) {
      tag = 'Rounded';
    } else if (key.indexOf('Sharp') !== -1) {
      tag = 'Sharp';
    } else {
      tag = 'Filled';
    }
    const icon = {
      key,
      tag,
      Icon: mui[key],
    };
    allIconsMap[key] = icon;
    return icon;
  });
export default allIconsMap
