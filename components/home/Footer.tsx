export function Footer({ text }: { text: string }) {
    return (
        <footer className="py-8 text-center text-muted-foreground border-t">
            <p>© {new Date().getFullYear()} {text}</p>
        </footer>
    );
}
