document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.querySelector('input[type="text"]');
    const filterSelect = document.querySelector('select');
    const collegesSection = document.querySelectorAll('section')[1];
    const topRatedSection = document.querySelectorAll('section')[2];
    
    // Sample data for notes (would normally come from a database)
    const notesData = [
        {
            id: 1,
            title: "Data Structures - ITCS214",
            description: "Essential structures (arrays, linked lists, trees, graphs) and algorithms with complexity analysis.",
            college: "it",
            course: "ITCS214",
            author: "Maryam Ali",
            rating: 5,
            ratedBy: "Sarah M.",
            category: "top-rated"
        },
        {
            id: 2,
            title: "Linear Algebra - MATHS211",
            description: "Vectors, matrices, linear transformations, and systems of equations with applications to computer graphics, data science, and engineering.",
            college: "science",
            course: "MATHS211",
            author: "Dr. Mostafa Mohammed",
            rating: 5,
            ratedBy: "Rashid I.",
            category: "top-rated"
        },
        {
            id: 3,
            title: "Microbiology - LFS217",
            description: "Microbial life (bacteria, viruses, fungi) with emphasis on medical, environmental and industrial applications.",
            college: "hands",
            course: "LFS217",
            author: "Prof. Dana Alshaikh",
            rating: 4.5,
            ratedBy: "Fajer K.",
            category: "top-rated"
        }
    ];

    // College data
    const collegesData = [
        { name: "Engineering", icon: "fa-cog", color: "blue", courses: 6, notes: 12 },
        { name: "Science", icon: "fa-flask", color: "green", courses: 4, notes: 8 },
        { name: "Business Administration", icon: "fa-chart-line", color: "lime", courses: 3, notes: 6 },
        { name: "Arts", icon: "fa-palette", color: "pink", courses: 5, notes: 10 },
        { name: "Health and Sports Science", icon: "fa-heart-pulse", color: "purple", courses: 5, notes: 132 },
        { name: "Law", icon: "fa-gavel", color: "cyan", courses: 4, notes: 8 },
        { name: "Information Technology", icon: "fa-laptop-code", color: "orange", courses: 3, notes: 6 }
    ];

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();        

        // Filter colleges
        const collegeCards = collegesSection.querySelectorAll('a');
        collegeCards.forEach(card => {
            const collegeName = card.querySelector('h3').textContent.toLowerCase();
            if (collegeName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Filter top-rated notes
        const noteCards = topRatedSection.querySelectorAll('a');
        noteCards.forEach(card => {
            const noteTitle = card.querySelector('p').textContent.toLowerCase();
            const noteDesc = card.querySelector('h2').textContent.toLowerCase();
            if (noteTitle.includes(searchTerm) || noteDesc.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
    });

    // Filter functionality
    filterSelect.addEventListener('change', function() {
        const filterValue = this.value;
        
        // Reset all displays first
        const allCards = document.querySelectorAll('section a');
        allCards.forEach(card => card.style.display = 'block');
        
        // Apply filter
        if (filterValue === "All") {
            collegesSection.style.display = 'block';
            topRatedSection.style.display = 'block';
        }
        else if (filterValue === "Colleges") {
            topRatedSection.style.display = 'none';
            collegesSection.style.display = 'block';
        } 
        else if (filterValue === "Top Rated") {
            collegesSection.style.display = 'none';
            topRatedSection.style.display = 'block';
        }
        else if (filterValue === "A-Z") {
            sortCardsAlphabetically(true);
            collegesSection.style.display = 'block';
            topRatedSection.style.display = 'block';
        }
        else if (filterValue === "Z-A") {
            sortCardsAlphabetically(false);
            collegesSection.style.display = 'block';
            topRatedSection.style.display = 'block';
        }
    });

    // Helper function to sort cards alphabetically
    function sortCardsAlphabetically(ascending = true) {
        // Sort colleges
        const collegeContainer = collegesSection.querySelector('.grid');
        const collegeCards = Array.from(collegeContainer.querySelectorAll('a'));
        
        collegeCards.sort((a, b) => {
            const nameA = a.querySelector('h3').textContent.toLowerCase();
            const nameB = b.querySelector('h3').textContent.toLowerCase();
            return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        
        collegeCards.forEach(card => collegeContainer.appendChild(card));
        
        // Sort top-rated notes
        const notesContainer = topRatedSection.querySelector('.grid');
        const noteCards = Array.from(notesContainer.querySelectorAll('a'));
        
        noteCards.sort((a, b) => {
            const titleA = a.querySelector('p').textContent.toLowerCase();
            const titleB = b.querySelector('p').textContent.toLowerCase();
            return ascending ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
        });
        
        noteCards.forEach(card => notesContainer.appendChild(card));
    }

    // Initialize the page
    function initPage() {
        // Make sure the select element has "All" as first option
        if (filterSelect.options[0].value !== "All") {
            const allOption = new Option("All", "All");
            filterSelect.insertBefore(allOption, filterSelect.options[0]);
        }
        
        // Set "All" as default selected option
        filterSelect.selectedIndex = 0;
        // You could load data from an API here
        console.log("Page initialized with search and filter functionality");
    }

    initPage();
});

// Add Note Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Modal elements
  const addNoteBtn = document.querySelector('.bg-orange-600');
  const modal = document.getElementById('addNoteModal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelNote');
  const noteForm = document.getElementById('noteForm');

  // Open modal when Add Note button is clicked
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.remove('hidden');
    });
  }

  // Close modal methods
  function closeModal() {
    modal.classList.add('hidden');
    noteForm.reset();
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking outside modal
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle form submission
  if (noteForm) {
    noteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const course = document.getElementById('course').value;
      const title = document.getElementById('title').value;
      const content = document.getElementById('content').value;
      const file = document.getElementById('file').value.split(',').map(tag => tag.trim());

      // Create note object
      const newNote = {
        id: Date.now(), // Using timestamp as temporary ID
        course,
        title,
        content,
        tags,
        date: new Date().toLocaleDateString(),
        author: "Current User" // You would replace with actual user
      };
      
      
      console.log('New note created:', newNote);
      
      // For demo purposes - just show alert and close modal
      alert('Note saved successfully!');
      closeModal();
      
      saveNoteToDatabase(newNote).then(() => {
      closeModal();
      refreshNotesList();
      });
    });
  }

  // Example function to actually save the note
  function saveNoteToDatabase(note) {
    // This would be replaced with actual API call
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Get existing notes or initialize array
        const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Add new note
        existingNotes.push(note);
        
        // Save back to localStorage
        localStorage.setItem('notes', JSON.stringify(existingNotes));
        
        resolve();
      }, 500);
    });
  }
  
});


document.addEventListener('DOMContentLoaded', function() {
    // Get the current page name from the body's name attribute or URL
    const bodyName = document.body.getAttribute('name') || 
                    window.location.pathname.split('/').pop().replace('.html', '');
    
    // Initialize based on the current page
    switch(bodyName.toLowerCase()) {
        case 'arts':
            initCollegePage({
                courses: artsCourses,
                primaryColor: 'pink',
                collegeName: 'Arts'
            });
            break;
            
        case 'business':
            initCollegePage({
                courses: businessCourses,
                primaryColor: 'lime',
                collegeName: 'Business Administration'
            });
            break;
            
        case 'engineering':
            initCollegePage({
                courses: engineeringCourses,
                primaryColor: 'blue',
                collegeName: 'Engineering'
            });
            break;
            
        case 'handsscience':
        case 'hands':
            initCollegePage({
                courses: healthSportsCourses,
                primaryColor: 'purple',
                collegeName: 'Health and Sports Science'
            });
            break;
            
        case 'it':
            initCollegePage({
                courses: itCourses,
                primaryColor: 'orange',
                collegeName: 'Information Technology'
            });
            break;
            
        case 'law':
            initCollegePage({
                courses: lawCourses,
                primaryColor: 'cyan',
                collegeName: 'Law'
            });
            break;
            
        case 'science':
            initCollegePage({
                courses: scienceCourses,
                primaryColor: 'green',
                collegeName: 'Science'
            });
            break;
            
        default:
            console.error('Unknown college page:', bodyName);
    }
});

// Course data for all colleges
 
const artsCourses = [
    {
      id: 1,
      title: "Introduction to Painting - ARTS101",
      department: "Visual Arts Department",
      rating: 4.7,
      chapters: [
        {
          title: "Chapter 1: Color Theory",
          description: "Fundamentals of color mixing, harmonies, and psychological effects in painting.",
          uploaded: "5 days ago",
        },
        {
          title: "Chapter 2: Composition Techniques",
          description: "Rule of thirds, golden ratio, and other composition principles for visual balance.",
          uploaded: "2 days ago",
        }
      ]
    },
    {
      id: 2,
      title: "Art History Survey - ARTH201",
      department: "Art History Department",
      rating: 4.5,
      chapters: [
        {
          title: "Chapter 1: Renaissance Art",
          description: "Major artists, techniques, and cultural context of the Renaissance period.",
          uploaded: "1 week ago",
        },
        {
          title: "Chapter 2: Modern Art Movements",
          description: "From Impressionism to Abstract Expressionism - key movements and artists.",
          uploaded: "3 days ago",
        }
      ]
    },
    {
      id: 3,
      title: "Theater Performance - THTR301",
      department: "Performing Arts Department",
      rating: 4.8,
      chapters: [
        {
          title: "Chapter 1: Acting Techniques",
          description: "Stanislavski, Meisner, and other foundational acting methods.",
          uploaded: "4 days ago",
        },
        {
          title: "Chapter 2: Stage Direction",
          description: "Blocking, pacing, and visual storytelling for stage productions.",
          uploaded: "1 day ago",
        }
      ]
    },
    {
      id: 4,
      title: "Graphic Design Principles - DESN203",
      department: "Design Department",
      rating: 4.6,
      chapters: [
        {
          title: "Chapter 1: Typography Basics",
          description: "Typefaces, hierarchy, and readability principles in design.",
          uploaded: "1 week ago",
        },
        {
          title: "Chapter 2: Digital Design Tools",
          description: "Essential techniques for Adobe Creative Suite and other design software.",
          uploaded: "5 days ago",
        }
      ]
    },
    {
      id: 5,
      title: "Sculpture Workshop - ARTS210",
      department: "Visual Arts Department",
      rating: 4.9,
      chapters: [
        {
          title: "Chapter 1: Materials and Techniques",
          description: "Working with clay, stone, metal, and other sculptural media.",
          uploaded: "3 days ago",
        },
        {
          title: "Chapter 2: Contemporary Sculpture",
          description: "Installation art, conceptual approaches, and modern sculptural practices.",
          uploaded: "1 day ago",
        }
      ]
    }
  ];

  const businessCourses = [
    {
      id: 1,
      title: "Principles of Management - BUS101",
      department: "Management Department",
      rating: 4.6,
      chapters: [
        {
          title: "Chapter 1: Management Functions",
          description: "Planning, organizing, leading, and controlling in modern organizations with case studies.",
          uploaded: "5 days ago",
        },
        {
          title: "Chapter 2: Organizational Behavior",
          description: "Motivation theories, team dynamics, and leadership styles in business contexts.",
          uploaded: "2 days ago",
        }
      ]
    },
    {
      id: 2,
      title: "Financial Accounting - BUS201",
      department: "Accounting Department",
      rating: 4.7,
      chapters: [
        {
          title: "Chapter 1: Accounting Fundamentals",
          description: "Balance sheets, income statements, and cash flow statements preparation and analysis.",
          uploaded: "1 week ago",
        },
        {
          title: "Chapter 2: Financial Ratios",
          description: "Liquidity, profitability, and solvency ratios with real company financial analysis.",
          uploaded: "3 days ago",
        }
      ]
    },
    {
      id: 3,
      title: "Marketing Principles - BUS210",
      department: "Marketing Department",
      rating: 4.8,
      chapters: [
        {
          title: "Chapter 1: Marketing Mix (4Ps)",
          description: "Product, price, place, and promotion strategies with contemporary examples.",
          uploaded: "4 days ago",
        },
        {
          title: "Chapter 2: Consumer Behavior",
          description: "Psychological and social factors influencing purchasing decisions.",
          uploaded: "1 day ago",
        }
      ]
    }
  ];


const engineeringCourses = [
    {
    id: 1,
    title: "Thermodynamics - MECH201",
    department: "Mechanical Engineering Department",
    rating: 4.7,
    chapters: [
      {
        title: "Chapter 1: Fundamental Concepts",
        description: "Basic concepts of thermodynamics, systems, properties, and the first law of thermodynamics.",
        uploaded: "4 days ago",
      },
      {
        title: "Chapter 2: Second Law Analysis",
        description: "Entropy, Carnot cycle, and thermodynamic efficiency calculations.",
        uploaded: "1 day ago",
      }
    ]
    },
    {
    id: 2,
    title: "Circuit Analysis - ELEC202",
    department: "Electrical Engineering Department",
    rating: 4.5,
    chapters: [
      {
        title: "Chapter 1: DC Circuit Analysis",
        description: "Ohm's law, Kirchhoff's laws, nodal and mesh analysis techniques.",
        uploaded: "1 week ago",
      },
      {
        title: "Chapter 2: AC Circuit Fundamentals",
        description: "Phasors, impedance, power in AC circuits, and frequency response.",
        uploaded: "3 days ago",
      }
    ]
    },
    {
    id: 3,
    title: "Structural Analysis - CIVE301",
    department: "Civil Engineering Department",
    rating: 4.6,
    chapters: [
      {
        title: "Chapter 1: Statically Determinate Structures",
        description: "Analysis of trusses, beams, and frames using equilibrium equations.",
        uploaded: "5 days ago",
      },
      {
        title: "Chapter 2: Influence Lines",
        description: "Moving loads and their effects on beams and trusses.",
        uploaded: "2 days ago",
      }
    ]
    },
    {
    id: 4,
    title: "Fluid Mechanics - MECH203",
    department: "Mechanical Engineering Department",
    rating: 4.4,
    chapters: [
      {
        title: "Chapter 1: Fluid Properties",
        description: "Viscosity, pressure, density, and other fundamental fluid properties.",
        uploaded: "6 days ago",
      },
      {
        title: "Chapter 2: Bernoulli's Equation",
        description: "Applications of Bernoulli's principle to fluid flow problems.",
        uploaded: "1 day ago",
      }
    ]
    },
    {
    id: 5,
    title: "Digital Systems - ELEC205",
    department: "Electrical Engineering Department",
    rating: 4.8,
    chapters: [
      {
        title: "Chapter 1: Logic Gates and Boolean Algebra",
        description: "Fundamentals of digital logic, truth tables, and simplification techniques.",
        uploaded: "3 days ago",
      },
      {
        title: "Chapter 2: Sequential Circuits",
        description: "Flip-flops, registers, and basic sequential circuit design.",
        uploaded: "1 day ago",
      }
    ]
    },
    {
    id: 6,
    title: "Geotechnical Engineering - CIVE302",
    department: "Civil Engineering Department",
    rating: 4.3,
    chapters: [
      {
        title: "Chapter 1: Soil Properties",
        description: "Classification, compaction, and permeability of soils.",
        uploaded: "1 week ago",
      },
      {
        title: "Chapter 2: Bearing Capacity",
        description: "Foundation design principles and soil bearing capacity calculations.",
        uploaded: "4 days ago",
      }
    ]
    }
    ];

    const healthSportsCourses = [
        {
          id: 1,
          title: "Human Anatomy & Physiology - HSS101",
          department: "Health Sciences Department",
          rating: 4.8,
          chapters: [
            {
              title: "Chapter 1: Musculoskeletal System",
              description: "Detailed study of bones, joints, and muscles with clinical applications for sports injuries.",
              uploaded: "4 days ago",
            },
            {
              title: "Chapter 2: Cardiorespiratory System",
              description: "Heart and lung function during exercise, including VO2 max and aerobic capacity.",
              uploaded: "1 day ago",
            }
          ]
        },
        {
          id: 2,
          title: "Exercise Physiology - HSS202",
          department: "Sports Science Department",
          rating: 4.7,
          chapters: [
            {
              title: "Chapter 1: Energy Systems",
              description: "ATP-PC, glycolytic, and oxidative systems in different exercise intensities.",
              uploaded: "1 week ago",
            },
            {
              title: "Chapter 2: Environmental Physiology",
              description: "Body's response to exercise in heat, cold, and altitude conditions.",
              uploaded: "3 days ago",
            }
          ]
        },
        {
          id: 3,
          title: "Sports Nutrition - HSS215",
          department: "Nutrition Department",
          rating: 4.9,
          chapters: [
            {
              title: "Chapter 1: Macronutrient Needs",
              description: "Optimal protein, carb, and fat ratios for different sports and training phases.",
              uploaded: "5 days ago",
            },
            {
              title: "Chapter 2: Hydration Strategies",
              description: "Electrolyte balance and fluid replacement protocols for athletes.",
              uploaded: "2 days ago",
            }
          ]
        },
        {
          id: 4,
          title: "Biomechanics - HSS305",
          department: "Sports Science Department",
          rating: 4.6,
          chapters: [
            {
              title: "Chapter 1: Kinematics",
              description: "Motion analysis of sports techniques including projectile motion and angular kinetics.",
              uploaded: "1 week ago",
            },
            {
              title: "Chapter 2: Injury Mechanisms",
              description: "Force analysis of common sports injuries and preventive strategies.",
              uploaded: "4 days ago",
            }
          ]
        },
        {
          id: 5,
          title: "Public Health Fundamentals - HSS110",
          department: "Health Sciences Department",
          rating: 4.5,
          chapters: [
            {
              title: "Chapter 1: Epidemiology Basics",
              description: "Disease patterns, risk factors, and prevention strategies in populations.",
              uploaded: "6 days ago",
            },
            {
              title: "Chapter 2: Health Promotion",
              description: "Designing effective exercise and nutrition programs for community health.",
              uploaded: "1 day ago",
            }
          ]
        }
      ];

const itCourses = [
    {
      id: 1,
      title: "Data Structures - ITCS214",
      department: "Computer Science Department",
      rating: 4.8,
      chapters: [
        {
          title: "Chapter 1: Arrays & Linked Lists",
          description: "Implementation and complexity analysis of linear data structures in Python and Java.",
          uploaded: "5 days ago",
        },
        {
          title: "Chapter 2: Trees & Graphs",
          description: "Binary trees, BST, AVL trees, and graph representation with traversal algorithms.",
          uploaded: "2 days ago",
        }
      ]
    },
    {
      id: 2,
      title: "Computer Networks - ITCE316",
      department: "Networking Department",
      rating: 4.6,
      chapters: [
        {
          title: "Chapter 1: Network Protocols",
          description: "OSI model, TCP/IP stack, and common networking protocols with packet analysis.",
          uploaded: "1 week ago",
        },
        {
          title: "Chapter 2: Network Security",
          description: "Encryption, firewalls, VPNs, and common network vulnerabilities and defenses.",
          uploaded: "3 days ago",
        }
      ]
    },
    {
      id: 3,
      title: "Database Systems - ITCS285",
      department: "Data Science Department",
      rating: 4.7,
      chapters: [
        {
          title: "Chapter 1: SQL Fundamentals",
          description: "Database design, normalization, and CRUD operations with MySQL and PostgreSQL.",
          uploaded: "4 days ago",
        },
        {
          title: "Chapter 2: NoSQL Databases",
          description: "MongoDB, Redis, and other non-relational database systems with use cases.",
          uploaded: "1 day ago",
        }
      ]
    }
    ];
    

    const lawCourses = [
        {
          id: 1,
          title: "Criminal Law - LAW101",
          department: "Law Department",
          rating: 4.7,
          chapters: [
            {
              title: "Chapter 1: Elements of Crime",
              description: "Actus reus, mens rea, and causation principles with landmark case studies.",
              uploaded: "5 days ago",
            },
            {
              title: "Chapter 2: Defenses in Criminal Law",
              description: "Complete guide to insanity, self-defense, duress and other legal defenses.",
              uploaded: "2 days ago",
            }
          ]
        },
        {
          id: 2,
          title: "Corporate Law - LAW210",
          department: "Commercial Law Department",
          rating: 4.5,
          chapters: [
            {
              title: "Chapter 1: Company Formation",
              description: "Legal requirements and procedures for incorporating different business entities.",
              uploaded: "1 week ago",
            },
            {
              title: "Chapter 2: Directors' Duties",
              description: "Fiduciary responsibilities and legal obligations of company directors.",
              uploaded: "3 days ago",
            }
          ]
        },
        {
          id: 3,
          title: "International Law - LAW305",
          department: "Global Legal Studies",
          rating: 4.8,
          chapters: [
            {
              title: "Chapter 1: Sources of International Law",
              description: "Treaties, customs, and general principles governing international relations.",
              uploaded: "4 days ago",
            },
            {
              title: "Chapter 2: State Responsibility",
              description: "Legal consequences of internationally wrongful acts by states.",
              uploaded: "1 day ago",
            }
          ]
        },
        {
          id: 4,
          title: "Constitutional Law - LAW220",
          department: "Public Law Department",
          rating: 4.6,
          chapters: [
            {
              title: "Chapter 1: Judicial Review",
              description: "Principles and procedures for reviewing administrative decisions.",
              uploaded: "1 week ago",
            },
            {
              title: "Chapter 2: Fundamental Rights",
              description: "Analysis of constitutional protections and human rights jurisprudence.",
              uploaded: "5 days ago",
            }
          ]
        }
      ];

      const scienceCourses = [
        {
          id: 1,
          title: "General Biology - BIOL101",
          department: "Biology Department",
          rating: 4.7,
          chapters: [
            {
              title: "Chapter 1: Cell Structure",
              description: "Detailed study of prokaryotic and eukaryotic cell structures and functions with labeled diagrams.",
              uploaded: "5 days ago",
            },
            {
              title: "Chapter 2: Genetics Basics",
              description: "Mendelian genetics, DNA structure, and replication processes with practice problems.",
              uploaded: "2 days ago",
            }
          ]
        },
        {
          id: 2,
          title: "Organic Chemistry - CHEM201",
          department: "Chemistry Department",
          rating: 4.5,
          chapters: [
            {
              title: "Chapter 1: Functional Groups",
              description: "Identification and properties of major organic functional groups with examples.",
              uploaded: "1 week ago",
            },
            {
              title: "Chapter 2: Reaction Mechanisms",
              description: "Detailed SN1, SN2, E1, and E2 reaction mechanisms with examples and energy diagrams.",
              uploaded: "3 days ago",
            }
          ]
        },
        {
          id: 3,
          title: "Quantum Physics - PHYS301",
          department: "Physics Department",
          rating: 4.8,
          chapters: [
            {
              title: "Chapter 1: Wave-Particle Duality",
              description: "Double-slit experiment and De Broglie wavelength concepts with mathematical derivations.",
              uploaded: "4 days ago",
            },
            {
              title: "Chapter 2: Schrödinger Equation",
              description: "Solutions to the time-independent Schrödinger equation for simple quantum systems.",
              uploaded: "1 day ago",
            }
          ]
        },
        {
          id: 4,
          title: "Calculus III - MATH203",
          department: "Mathematics Department",
          rating: 4.6,
          chapters: [
            {
              title: "Chapter 1: Multivariable Functions",
              description: "Limits, continuity, and partial derivatives of multivariable functions with examples.",
              uploaded: "1 week ago",
            },
            {
              title: "Chapter 2: Multiple Integrals",
              description: "Double and triple integrals with applications to volume and mass calculations.",
              uploaded: "5 days ago",
            }
          ]
        }
      ];

// Main initialization function for all college pages
function initCollegePage(config) {
    // Pagination variables
    const notesPerPage = 2;
    let currentPage = 1;
    const totalPages = Math.ceil(config.courses.length / notesPerPage);
    
    // DOM elements
    const notesContainer = document.getElementById('it-notes-container');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const searchBar = document.getElementById('search-bar');
    const filterDropdown = document.getElementById('filter-dropdown');
    
    // Set college-specific styles if needed
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    
    // Initialize
    renderNotes();
    renderPagination();
    
    // Event listeners
    prevButton.addEventListener('click', goToPreviousPage);
    nextButton.addEventListener('click', goToNextPage);
    searchBar.addEventListener('input', renderNotes);
    filterDropdown.addEventListener('change', renderNotes);
    
    // Functions
    function renderNotes() {
        notesContainer.innerHTML = '';
        const searchQuery = searchBar.value.toLowerCase();
        const filterValue = filterDropdown.value;

        let filteredCourses = config.courses.filter(course => 
            course.title.toLowerCase().includes(searchQuery) ||
            course.department.toLowerCase().includes(searchQuery)
        );

        // Apply filters
        switch(filterValue) {
            case 'top-rated':
                filteredCourses.sort((a, b) => b.rating - a.rating);
                break;
            case 'recently-added':
                filteredCourses.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
                break;
            case 'a-z':
                filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'z-a':
                filteredCourses.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        // Pagination
        const startIndex = (currentPage - 1) * notesPerPage;
        const endIndex = startIndex + notesPerPage;
        const coursesToShow = filteredCourses.slice(startIndex, endIndex);
        
        // Render courses
        coursesToShow.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300';
            courseElement.innerHTML = `
                <!-- Course Header -->
                <div class="bg-blue-950 p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-white">${course.title}</h3>
                        <p class="text-gray-300 text-sm">${course.department}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="flex items-center text-yellow-500">
                            ${renderRatingStars(course.rating)}
                            <span class="ml-1 text-gray-300">${course.rating}</span>
                        </span>
                    </div>
                </div>
                
                <!-- Chapters List -->
                <div class="divide-y divide-gray-200">
                    ${course.chapters.map(chapter => `
                        <div class="p-6 hover:bg-gray-50 transition">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-semibold text-blue-900">${chapter.title}</h4>
                                <span class="text-xs text-gray-500">${chapter.uploaded}</span>
                            </div>
                            <div class="flex justify-between items-center space-x-3">
                                <p class="text-gray-600 text-sm mb-3">${chapter.description}</p>
                                <button class="bg-${config.primaryColor}-600 hover:bg-${config.primaryColor}-700 text-white px-3 py-1 rounded-md text-sm font-medium">
                                    <i class="fas fa-download mr-1"></i> Download
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            notesContainer.appendChild(courseElement);
        });
    }
    
    function renderRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    function renderPagination() {
        pageNumbersContainer.innerHTML = '';
        
        // Previous button state
        prevButton.disabled = currentPage === 1;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `px-4 py-2 rounded-md ${currentPage === i ? `bg-${config.primaryColor}-600 text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => goToPage(i));
            pageNumbersContainer.appendChild(pageButton);
        }
        
        // Next button state
        nextButton.disabled = currentPage === totalPages;
    }
    
    function goToPage(page) {
        currentPage = page;
        renderNotes();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function goToPreviousPage() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }
    
    function goToNextPage() {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    }
}