import 'package:flutter/material.dart';

void main() {
  runApp(ParkEasy());
}

class ParkEasy extends StatelessWidget {
  const ParkEasy({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ParkEasy',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: Scaffold(
        appBar: AppBar(title: Text('ParkEasy')),
        body: Center(child: Text('Welcome to ParkEasy!')),
      ),
    );
  }
}
