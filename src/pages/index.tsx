import Link from "next/link";

export default function Home() {
    return (
        <div>
            <h2>NextJS Routes</h2>
            <ul>
                <li>
                    <Link href="/a">
                        <a>a</a>
                    </Link>
                </li>
                <li>
                    <Link href="/b">
                        <a>b</a>
                    </Link>
                </li>
                <li>
                    <Link href="/c">
                        <a>c</a>
                    </Link>
                </li>
            </ul>
            <h2>entity-routes</h2>
            <ul>
                <li>
                    <Link href="/entity-routes">
                        <a>routes list</a>
                    </Link>
                </li>
                <li>
                    <Link href="/entity-routes/user">
                        <a>user_list</a>
                    </Link>
                </li>
                <li>
                    <Link href="/entity-routes/user/mapping">
                        <a>user_list_mapping</a>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
