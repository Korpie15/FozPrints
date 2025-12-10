export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary-600">Forester</span>
              <span className="text-xl font-bold text-gray-900">Hub</span>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Your trusted source for genuine Subaru Forester parts. Quality parts, 
              competitive prices, and fast shipping.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products" className="text-sm text-gray-600 hover:text-primary-600">
                  All Parts
                </a>
              </li>
              <li>
                <a href="/products?category=engine" className="text-sm text-gray-600 hover:text-primary-600">
                  Engine Parts
                </a>
              </li>
              <li>
                <a href="/products?category=exterior" className="text-sm text-gray-600 hover:text-primary-600">
                  Exterior Parts
                </a>
              </li>
              <li>
                <a href="/products?category=interior" className="text-sm text-gray-600 hover:text-primary-600">
                  Interior Parts
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ForesterHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
