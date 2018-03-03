// import { Firebase } from '../lib/firebase';
// import { Actions } from 'react-native-router-flux';

// const withAuthorisation = (Component) => {
//   return class withAuthorisation extends Component {
// 	componentDidMount() {
//       Firebase.auth.onAuthStateChanged(authUser => {
//         if (!Firebase.auth().currentUser) {
//           Actions.login()
//         }
//       });
//     }

//     render() {
//       return Firebase.auth().currentUser ? <Component /> : null;
//     }
//   }
// }

// export default withAuthorisation;