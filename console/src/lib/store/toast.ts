import { get, writable } from 'svelte/store';

export interface ToastProps {
	id?: number;
	message: string;
	type: ToastType;
	closeAfter?: number;
	removeOnNavigate?: boolean;
}

const toast = writable<ToastProps[]>([]);
const order = writable<number>(0);

export enum ToastType {
	success,
	warning,
	error
}

const push = (props: ToastProps) => {
	props.id = get(order);
	order.set(++props.id);

	const temp = get(toast);
	temp.push(props);
	toast.set(temp);
};

const pop = (id: number | undefined) => {
	toast.set(get(toast).filter((t) => id !== t.id));
};

const onNavigate = () => {
	toast.set(get(toast).filter((t) => !t.removeOnNavigate));
};

export default {
	store: toast,
	push,
	pop,
	onNavigate
};
