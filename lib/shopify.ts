const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const endpoint = `https://${domain}/api/2024-10/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ data: T; errors?: any[] }> {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const json = await result.json();

    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
    }

    return json;
  } catch (error) {
    console.error('Shopify API Error:', error);
    throw error;
  }
}

// GraphQL Fragments
const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    description
    descriptionHtml
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 5) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 10) {
      edges {
        node {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

// Get all products
export async function getProducts() {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProducts {
      products(first: 50) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `;

  const { data } = await shopifyFetch<any>({ query });
  return data.products.edges.map((edge: any) => edge.node);
}

// Get single product by handle
export async function getProduct(handle: string) {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        ...ProductFragment
      }
    }
  `;

  const { data } = await shopifyFetch<any>({ 
    query, 
    variables: { handle } 
  });
  
  return data.product;
}

// Create a cart
export async function createCart() {
  const query = `
    ${CART_FRAGMENT}
    mutation CreateCart {
      cartCreate {
        cart {
          ...CartFragment
        }
      }
    }
  `;

  const { data } = await shopifyFetch<any>({ query });
  return data.cartCreate.cart;
}

// Add items to cart
export async function addToCart(cartId: string, lines: Array<{ merchandiseId: string; quantity: number }>) {
  const query = `
    ${CART_FRAGMENT}
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
      }
    }
  `;

  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId, lines },
  });

  return data.cartLinesAdd.cart;
}

// Update cart line items
export async function updateCartLines(cartId: string, lines: Array<{ id: string; quantity: number }>) {
  const query = `
    ${CART_FRAGMENT}
    mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
      }
    }
  `;

  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId, lines },
  });

  return data.cartLinesUpdate.cart;
}

// Remove cart line items
export async function removeFromCart(cartId: string, lineIds: string[]) {
  const query = `
    ${CART_FRAGMENT}
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFragment
        }
      }
    }
  `;

  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId, lineIds },
  });

  return data.cartLinesRemove.cart;
}

// Get cart by ID
export async function getCart(cartId: string) {
  const query = `
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFragment
      }
    }
  `;

  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId },
  });

  return data.cart;
}
