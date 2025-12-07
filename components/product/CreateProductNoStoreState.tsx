export default function CreateProductNoStoreState() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No Store Selected
          </h2>
          <p className="text-muted-foreground">
            Please select a store from the header to create a product.
          </p>
        </div>
      </div>
    </div>
  );
}
