import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './cartable.css';

const CarTable = () => {
  const CARS_PER_PAGE = 20;
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(CARS_PER_PAGE);
  const [marks, setMarks] = useState([]);
  const [selectedMark, setSelectedMark] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/fetchCars');
        setCars(response.data);
        setFilteredCars(response.data);
        extractMarks(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCars();
  }, []);

  const extractMarks = (cars) => {
    const markCount = cars.reduce((acc, car) => {
      acc[car.mark] = (acc[car.mark] || 0) + 1;
      return acc;
    }, {});

    setMarks(Object.entries(markCount));
  };

  const handleMarkSelect = (mark) => {
    setSelectedMark(mark);
    setSelectedModels([]);
    const filtered = cars.filter(car => car.mark === mark);
    setFilteredCars(filtered);
    extractModels(filtered);
  };

  const extractModels = (cars) => {
    const modelCount = cars.reduce((acc, car) => {
      if (car.model) {
        acc[car.model] = (acc[car.model] || 0) + 1;
      }
      return acc;
    }, {});

    setModels(Object.entries(modelCount));
  };

  const handleModelSelect = (model) => {
    setSelectedModels(prevSelectedModels => {
      const isSelected = prevSelectedModels.includes(model);
      const newSelectedModels = isSelected 
        ? prevSelectedModels.filter(m => m !== model) 
        : [...prevSelectedModels, model];

      const filtered = cars.filter(car =>
        car.mark === selectedMark &&
        (newSelectedModels.length === 0 || newSelectedModels.includes(car.model))
      );

      setFilteredCars(filtered);
      return newSelectedModels;
    });
  };

  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    const pageNumbers = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage < 5) {
        pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage > totalPages - 4) {
        pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pageNumbers.map((number, index) => (
      <button
        key={index}
        onClick={() => number !== '...' && paginate(number)}
        className={currentPage === number ? 'active' : ''}
        disabled={number === '...'}
      >
        {number}
      </button>
    ));
  };

  return (
    <div className="container">
      <div className="filters">
        {marks.map(([mark, count]) => (
          <React.Fragment key={mark}>
            <button
              onClick={() => handleMarkSelect(mark)}
              className={selectedMark === mark ? 'active' : ''}
            >
              {mark} 
            </button>
            <span>{count}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="model-select">
        {selectedMark && models.map(([model]) => (
          <button
            key={model}
            onClick={() => handleModelSelect(model)}
            className={selectedModels.includes(model) ? 'active' : ''}
          >
            {model}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Марка/модель</th>
            <th>Модификация</th>
            <th>Комплектация</th>
            <th>Стоимость</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          {currentCars.map(car => (
            <tr key={car._id}>
              <td>{car._id}</td>
              <td>{car.mark} {car.model}</td>
              <td>{car.engine.volume} AMT ({car.engine.power} л.с.) {car.drive}</td>
              <td>{car.equipmentName}</td>
              <td>{car.price.toLocaleString()} Р</td>
              <td>{new Date(car.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {renderPageNumbers()}
      </div>
    </div>
  );
};

export default CarTable;
