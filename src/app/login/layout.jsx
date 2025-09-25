import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
    title: "Đăng nhập - DONIDG",
};

export default function LoginLayout({ children }) {
    return (
        <>
            <main>{children}</main>
        </>
    );
}
