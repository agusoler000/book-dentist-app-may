export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DentalFlow. All rights reserved.</p>
        <p className="mt-1">Designed for healthy smiles.</p>
      </div>
    </footer>
  );
}
