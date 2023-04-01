import Login from './Login';
import Project from './Project';
import Registration from './Registration';
import UpdateAccount from './UpdateAccount';
import UserRegistration from './UserRegistration';

class Zod {
	static readonly registration = Registration;
	static readonly userRegistration = UserRegistration;
	static readonly login = Login;
	static readonly project = Project;
	static readonly updateAccount = UpdateAccount;
}

export default Zod;
