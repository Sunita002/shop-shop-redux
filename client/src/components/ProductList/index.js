import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';

import ProductItem from '../ProductItem';
import { QUERY_PRODUCTS } from '../../utils/queries';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import { idbPromise } from '../../utils/helpers';
import spinner from '../../assets/spinner.gif'

function ProductList() {
    const dispatch = useDispatch();
    const state = useSelector(state => state);

    const { currentCategory } = state;
    const { loading, data } = useQuery(QUERY_PRODUCTS);

    useEffect(() => {
        if (data) {
            dispatch({
                type: UPDATE_PRODUCTS,
                products: data.products
            });

            // save to indexedDB
            data.products.forEach(product => {
                idbPromise('products', 'put', product);
            });
        } else if (!loading) {
            // if offline, get data from 'products' store
            idbPromise('products', 'get').then(products => {
                // use retrieved data to set global state for offline browsing
                dispatch({
                    type: UPDATE_PRODUCTS,
                    products: products
                })
            })
        }
    }, [data, loading, dispatch]);

    function filterProducts() {
        if (!currentCategory) {
            return state.products;
        }

        return state.products.filter(product => product.category._id === currentCategory);
    };

    return (
        <div className='my-2'>
            <h2>Our Products:</h2>
            {state.products.length ? (
                <div className='flex-row'>
                    {filterProducts().map(product => (
                        <ProductItem
                        key= {product._id}
                        _id={product._id}
                        image={product.image}
                        name={product.name}
                        price={product.price}
                        quantity={product.quantity}
                        />
                    ))}
                </div>
            ) : (
                <h3>You haven't added any products yet!</h3>
            )}
            { loading ? 
            <img src={spinner} alt='loading' />: null}
        </div>
    );
}