import React from 'react';
import { useParams } from 'react-router-dom';

function DetailsPage() {
    const { identifier } = useParams();

    return (
        <div>
            <h1>Details Page</h1>
            <p>Showing details for item with identifier: {identifier}</p>
            {/* Fetch and display more details based on the identifier */}
        </div>
    );
}

export default DetailsPage;