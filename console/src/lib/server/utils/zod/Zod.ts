import Login from "./Login";
import Project from "./Project";
import Registration from "./Registration";
import UpdateAccount from "./UpdateAccount";


class Zod {
    static readonly registration = Registration;
    static readonly login = Login;
    static readonly project = Project;
    static readonly updateAccount = UpdateAccount;
}

export default Zod;