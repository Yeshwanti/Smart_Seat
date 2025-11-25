import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';

void main() {
  runApp(const RestaurantBookingApp());
}

// Mock JSON data
const String mockTablesJson = '''
{
  "tables": [
    {"id": 1, "seats": 2, "status": "available", "location": "Window"},
    {"id": 2, "seats": 4, "status": "occupied", "location": "Center"},
    {"id": 3, "seats": 2, "status": "available", "location": "Patio"},
    {"id": 4, "seats": 6, "status": "reserved", "location": "Private"},
    {"id": 5, "seats": 4, "status": "available", "location": "Bar"},
    {"id": 6, "seats": 8, "status": "occupied", "location": "Main Hall"},
    {"id": 7, "seats": 2, "status": "available", "location": "Corner"},
    {"id": 8, "seats": 4, "status": "reserved", "location": "Window"}
  ]
}
''';

class TableModel {
  final int id;
  final int seats;
  String status;
  final String location;

  TableModel({
    required this.id,
    required this.seats,
    required this.status,
    required this.location,
  });

  factory TableModel.fromJson(Map<String, dynamic> json) {
    return TableModel(
      id: json['id'],
      seats: json['seats'],
      status: json['status'],
      location: json['location'],
    );
  }
}

class Reservation {
  final int tableId;
  final String customerName;
  final int partySize;
  final DateTime bookingTime;
  DateTime? expiryTime;

  Reservation({
    required this.tableId,
    required this.customerName,
    required this.partySize,
    required this.bookingTime,
    this.expiryTime,
  });
}

class RestaurantBookingApp extends StatelessWidget {
  const RestaurantBookingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Restaurant Booking',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  List<TableModel> tables = [];
  List<Reservation> reservations = [];
  List<Map<String, dynamic>> queueList = [];

  @override
  void initState() {
    super.initState();
    _loadTables();
  }

  void _loadTables() {
    final data = json.decode(mockTablesJson);
    setState(() {
      tables = (data['tables'] as List)
          .map((table) => TableModel.fromJson(table))
          .toList();
    });
  }

  void _addReservation(Reservation reservation) {
    setState(() {
      reservations.add(reservation);
      final table = tables.firstWhere((t) => t.id == reservation.tableId);
      table.status = 'reserved';
    });
  }

  void _addToQueue(Map<String, dynamic> queueEntry) {
    setState(() {
      queueList.add(queueEntry);
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(tables: tables),
      BookTableScreen(
        tables: tables,
        onReservation: _addReservation,
      ),
      JoinQueueScreen(onAddToQueue: _addToQueue, queueList: queueList),
      ReservationStatusScreen(reservations: reservations, tables: tables),
    ];

    return Scaffold(
      body: screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _onItemTapped,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.book_online),
            label: 'Book Table',
          ),
          NavigationDestination(
            icon: Icon(Icons.people),
            label: 'Join Queue',
          ),
          NavigationDestination(
            icon: Icon(Icons.confirmation_number),
            label: 'Status',
          ),
        ],
      ),
    );
  }
}

// Home Screen
class HomeScreen extends StatelessWidget {
  final List<TableModel> tables;

  const HomeScreen({super.key, required this.tables});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'available':
        return Colors.green;
      case 'occupied':
        return Colors.red;
      case 'reserved':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Restaurant Tables'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: ListView.builder(
        itemCount: tables.length,
        padding: const EdgeInsets.all(8),
        itemBuilder: (context, index) {
          final table = tables[index];
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: _getStatusColor(table.status),
                child: Text(
                  '${table.id}',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
              title: Text('Table ${table.id} - ${table.location}'),
              subtitle: Text('${table.seats} seats'),
              trailing: Chip(
                label: Text(
                  table.status.toUpperCase(),
                  style: const TextStyle(fontSize: 10),
                ),
                backgroundColor: _getStatusColor(table.status).withOpacity(0.2),
              ),
            ),
          );
        },
      ),
    );
  }
}

// Book Table Screen
class BookTableScreen extends StatefulWidget {
  final List<TableModel> tables;
  final Function(Reservation) onReservation;

  const BookTableScreen({
    super.key,
    required this.tables,
    required this.onReservation,
  });

  @override
  State<BookTableScreen> createState() => _BookTableScreenState();
}

class _BookTableScreenState extends State<BookTableScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  int _partySize = 2;
  int? _selectedTableId;
  bool _isCountdownActive = false;
  int _remainingSeconds = 600;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _nameController.dispose();
    super.dispose();
  }

  void _startCountdown() {
    setState(() {
      _isCountdownActive = true;
      _remainingSeconds = 600;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
        } else {
          _timer?.cancel();
          _isCountdownActive = false;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Reservation time expired!')),
          );
        }
      });
    });
  }

  void _confirmReservation() {
    if (_formKey.currentState!.validate() && _selectedTableId != null) {
      final reservation = Reservation(
        tableId: _selectedTableId!,
        customerName: _nameController.text,
        partySize: _partySize,
        bookingTime: DateTime.now(),
        expiryTime: DateTime.now().add(const Duration(minutes: 10)),
      );

      widget.onReservation(reservation);
      _timer?.cancel();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reservation confirmed!')),
      );

      setState(() {
        _nameController.clear();
        _selectedTableId = null;
        _isCountdownActive = false;
        _remainingSeconds = 600;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final availableTables =
        widget.tables.where((t) => t.status == 'available').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book a Table'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Customer Name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                value: _partySize,
                decoration: const InputDecoration(
                  labelText: 'Party Size',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.people),
                ),
                items: List.generate(10, (i) => i + 1)
                    .map((size) => DropdownMenuItem(
                          value: size,
                          child: Text('$size ${size == 1 ? 'person' : 'people'}'),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    _partySize = value!;
                  });
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                value: _selectedTableId,
                decoration: const InputDecoration(
                  labelText: 'Select Table',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.table_bar),
                ),
                items: availableTables
                    .map((table) => DropdownMenuItem(
                          value: table.id,
                          child: Text(
                              'Table ${table.id} - ${table.seats} seats (${table.location})'),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedTableId = value;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Please select a table';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              if (_isCountdownActive)
                Card(
                  color: Colors.orange.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        const Text(
                          'Complete your booking within:',
                          style: TextStyle(fontSize: 16),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${(_remainingSeconds ~/ 60).toString().padLeft(2, '0')}:${(_remainingSeconds % 60).toString().padLeft(2, '0')}',
                          style: TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: _remainingSeconds < 60
                                ? Colors.red
                                : Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isCountdownActive ? null : _startCountdown,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Start Booking Process'),
              ),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: _isCountdownActive ? _confirmReservation : null,
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Confirm Reservation'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Join Queue Screen
class JoinQueueScreen extends StatefulWidget {
  final Function(Map<String, dynamic>) onAddToQueue;
  final List<Map<String, dynamic>> queueList;

  const JoinQueueScreen({
    super.key,
    required this.onAddToQueue,
    required this.queueList,
  });

  @override
  State<JoinQueueScreen> createState() => _JoinQueueScreenState();
}

class _JoinQueueScreenState extends State<JoinQueueScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  int _partySize = 2;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _joinQueue() {
    if (_formKey.currentState!.validate()) {
      widget.onAddToQueue({
        'name': _nameController.text,
        'partySize': _partySize,
        'joinTime': DateTime.now(),
        'position': widget.queueList.length + 1,
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Added to queue! Position: ${widget.queueList.length + 1}'),
        ),
      );

      _nameController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Walk-in Queue'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Your Name',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<int>(
                    value: _partySize,
                    decoration: const InputDecoration(
                      labelText: 'Party Size',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.people),
                    ),
                    items: List.generate(10, (i) => i + 1)
                        .map((size) => DropdownMenuItem(
                              value: size,
                              child: Text('$size ${size == 1 ? 'person' : 'people'}'),
                            ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _partySize = value!;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _joinQueue,
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Join Queue'),
                  ),
                ],
              ),
            ),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Current Queue (${widget.queueList.length})',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          Expanded(
            child: widget.queueList.isEmpty
                ? const Center(child: Text('No one in queue'))
                : ListView.builder(
                    itemCount: widget.queueList.length,
                    itemBuilder: (context, index) {
                      final entry = widget.queueList[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            child: Text('${entry['position']}'),
                          ),
                          title: Text(entry['name']),
                          subtitle: Text('Party of ${entry['partySize']}'),
                          trailing: Text(
                            '${DateTime.now().difference(entry['joinTime']).inMinutes} min',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// Reservation Status Screen
class ReservationStatusScreen extends StatefulWidget {
  final List<Reservation> reservations;
  final List<TableModel> tables;

  const ReservationStatusScreen({
    super.key,
    required this.reservations,
    required this.tables,
  });

  @override
  State<ReservationStatusScreen> createState() =>
      _ReservationStatusScreenState();
}

class _ReservationStatusScreenState extends State<ReservationStatusScreen> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  String _getRemainingTime(DateTime? expiryTime) {
    if (expiryTime == null) return 'N/A';
    final remaining = expiryTime.difference(DateTime.now());
    if (remaining.isNegative) return 'Expired';
    final minutes = remaining.inMinutes;
    final seconds = remaining.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reservation Status'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: widget.reservations.isEmpty
          ? const Center(child: Text('No active reservations'))
          : ListView.builder(
              itemCount: widget.reservations.length,
              padding: const EdgeInsets.all(8),
              itemBuilder: (context, index) {
                final reservation = widget.reservations[index];
                final table = widget.tables
                    .firstWhere((t) => t.id == reservation.tableId);
                final remainingTime =
                    _getRemainingTime(reservation.expiryTime);
                final isExpired = remainingTime == 'Expired';

                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              reservation.customerName,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            Chip(
                              label: Text('Table ${table.id}'),
                              backgroundColor: Colors.orange.shade100,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.people, size: 16),
                            const SizedBox(width: 4),
                            Text('Party of ${reservation.partySize}'),
                            const SizedBox(width: 16),
                            const Icon(Icons.location_on, size: 16),
                            const SizedBox(width: 4),
                            Text(table.location),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isExpired
                                ? Colors.red.shade50
                                : Colors.green.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Time Remaining:',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                remainingTime,
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: isExpired ? Colors.red : Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}